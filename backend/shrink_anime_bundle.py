import pickle
import sys
import types

# Stub sentence_transformers.model_card
st_model_card_module = "sentence_transformers.model_card"
if st_model_card_module not in sys.modules:
    model_card_module = types.ModuleType(st_model_card_module)

    class ModelCard:  # type: ignore
        pass

    class SentenceTransformerModelCardData:  # type: ignore
        pass

    def generate_model_card(*args, **kwargs):  # type: ignore
        return None

    model_card_module.ModelCard = ModelCard  # type: ignore[attr-defined]
    model_card_module.SentenceTransformerModelCardData = SentenceTransformerModelCardData  # type: ignore[attr-defined]
    model_card_module.generate_model_card = generate_model_card  # type: ignore[attr-defined]

    sys.modules[st_model_card_module] = model_card_module

# Stub BERT attention if needed
bert_module_name = "transformers.models.bert.modeling_bert"
try:
    bert_module = __import__(bert_module_name, fromlist=["*"])
    if not hasattr(bert_module, "BertSdpaSelfAttention"):
        class BertSdpaSelfAttention:  # type: ignore
            pass
        setattr(bert_module, "BertSdpaSelfAttention", BertSdpaSelfAttention)
except Exception:
    pass

SRC = "anime_recommender_bundle_backup.pkl"
DST = "anime_recommender_bundle.pkl"

with open(SRC, "rb") as f:
    bundle = pickle.load(f)

print("Original keys:", bundle.keys())

for key in ["model", "sentence_model", "tokenizer"]:
    if key in bundle:
        print(f"Removing key: {key}")
        bundle.pop(key)

print("Final keys:", bundle.keys())

with open(DST, "wb") as f:
    pickle.dump(bundle, f, protocol=4)

print("Saved lightweight bundle to", DST)