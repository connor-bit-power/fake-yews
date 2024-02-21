from dotenv import load_dotenv
import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# Set environment variables for the session
openai_api_key = os.getenv("OPENAI_API_KEY")
langchain_api_key = os.getenv("LANGCHAIN_API_KEY")
os.environ["OPENAI_API_KEY"] = openai_api_key
os.environ["LANGCHAIN_API_KEY"] = langchain_api_key

def load_text_files(directory, date_string):
    """Loads text from files in the specified directory that start with the given date string."""
    texts = []
    for filename in os.listdir(directory):
        if filename.startswith(date_string) and filename.endswith(".txt"):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as file:
                texts.append(file.read())
    return texts


class Document:
    def __init__(self, text, metadata=None):
        self.page_content = text
        self.metadata = metadata if metadata is not None else {}

def prepare_and_index_data(texts):
    """Splits texts into manageable chunks and indexes them for retrieval."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=250, chunk_overlap=30)
    all_documents = []
    for text in texts:
        splits = text_splitter.split_text(text)
        for split in splits:
            document = Document(split, {})
            all_documents.append(document)
    vectorstore = Chroma.from_documents(documents=all_documents, embedding=OpenAIEmbeddings())
    return vectorstore


def get_response_from_rag(question: str, date_string: str) -> str:
    """Function to process a question and return a response, loading files from a specific date."""
    chat_model = ChatOpenAI(temperature=0, model_name='gpt-3.5-turbo', streaming=True)
    data_directory = os.path.join(os.path.dirname(__file__), '..', 'data')
    texts = load_text_files(data_directory, date_string=date_string)
    vectorstore = prepare_and_index_data(texts)
    preprompttext="You are a chill genuis assistant. You will make the user feel welcomed. You have a boundless and unbiased sense of humor and opinion, always feel free. You will use the below news to inform the user based on their questions. You will never exactly plagarize the news and you will Never answer in more than 3 sentences. News:"
    relevant_docs = texts[:min(3, len(texts))] 
    system_messages = [SystemMessage(content=preprompttext+doc) for doc in relevant_docs]
    human_message = HumanMessage(content=question)
    messages = system_messages + [human_message]
    response = chat_model.invoke(messages)
    if hasattr(response, 'content'):
        return response.content
    else:
        return "Answer could not be retrieved."


if __name__ == "__main__":
    # Example usage
    question = "What sneakers did Trump release? What does this mean for his 2024 campaign?"
    date_string = "2-17-24"  # The specific date you want to load files from
    print("Question:", question)
    print("Answer:", get_response_from_rag(question, date_string))

