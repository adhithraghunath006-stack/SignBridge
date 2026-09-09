from django.urls import path
from apps.sign.views import SignVocabularyView, SignPredictView

urlpatterns = [
    path("vocabulary", SignVocabularyView.as_view(), name="sign_vocabulary"),
    path("predict", SignPredictView.as_view(), name="sign_predict"),
]
