import os
import logging
import glob
from typing import List, Dict, Optional
from haystack import Pipeline, Document
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.components.builders.prompt_builder import PromptBuilder
from haystack.components.generators import OpenAIGenerator
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.utils import Secret

logger = logging.getLogger(__name__)

class HaystackPipeline:
    def __init__(self):
        self.document_store = InMemoryDocumentStore()
        self.template = """
        You are a helpful industrial AI assistant for Al Sakr Online.
        Answer the user's question based ONLY on the provided context.
        If the answer is not in the context, say "I don't have enough information in my database."

        Context:
        {% for doc in documents %}
            {{ doc.content }}
        {% endfor %}

        Question: {{ question }}

        Answer:
        """
        
        self.rag_pipeline = Pipeline()
        self.rag_pipeline.add_component("retriever", InMemoryBM25Retriever(document_store=self.document_store))
        self.rag_pipeline.add_component("prompt_builder", PromptBuilder(template=self.template))
        
        # Pointing to Ollama
        self.rag_pipeline.add_component("llm", OpenAIGenerator(
            api_key=Secret.from_token("ollama"),
            api_base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434") + "/v1",
            model="llama3.2" 
        ))
        
        self.rag_pipeline.connect("retriever", "prompt_builder.documents")
        self.rag_pipeline.connect("prompt_builder", "llm")

    def query(self, question: str):
        result = self.rag_pipeline.run({
            "retriever": {"query": question},
            "prompt_builder": {"question": question}
        })
        return result["llm"]["replies"][0]

    def index_data(self, data: List[Dict]):
        """Index manual list of dicts"""
        docs = [Document(content=d["content"], meta=d["meta"]) for d in data]
        self.document_store.write_documents(docs)
        return len(docs)

    def index_directory(self, dir_path: str):
        """Index all .txt and .md files in the directory"""
        if not os.path.exists(dir_path):
            logger.warning(f"Directory {dir_path} does not exist.")
            return 0
            
        docs = []
        # Index Text Files
        for filepath in glob.glob(os.path.join(dir_path, "**/*.txt"), recursive=True):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    docs.append(Document(content=content, meta={"source": filepath, "type": "text"}))
            except Exception as e:
                logger.error(f"Failed to read {filepath}: {e}")

        # Index Markdown Files
        for filepath in glob.glob(os.path.join(dir_path, "**/*.md"), recursive=True):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    docs.append(Document(content=content, meta={"source": filepath, "type": "markdown"}))
            except Exception as e:
                logger.error(f"Failed to read {filepath}: {e}")
                
        if docs:
            self.document_store.write_documents(docs)
            logger.info(f"Indexed {len(docs)} files from {dir_path}")
            
        return len(docs)
