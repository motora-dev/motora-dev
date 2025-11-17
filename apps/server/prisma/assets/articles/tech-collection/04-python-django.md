---
title: PythonとDjangoで作るWebアプリケーション
---

## はじめに

このサンプル記事では、PythonとDjangoフレームワークを使用したWebアプリケーション開発について説明します。

## Pythonの魅力

Pythonは以下のような特徴を持つプログラミング言語です：

- 読みやすく直感的な構文
- 豊富なライブラリエコシステム
- 高い生産性
- 幅広い用途（Web開発、データサイエンス、AI/MLなど）

## Djangoフレームワーク

Djangoは、「バッテリー同梱」のWebフレームワークです。
以下の機能を標準で提供します：

- ORM（Object-Relational Mapping）
- 管理画面の自動生成
- セキュリティ機能
- URLルーティング
- テンプレートエンジン

### コードサンプル

```python
# models.py
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    published_date = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey('auth.User', on_delete=models.CASCADE)

    def __str__(self):
        return self.title

# views.py
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Article

def article_list(request):
    articles = Article.objects.all().order_by('-published_date')
    return render(request, 'articles/list.html', {'articles': articles})

def article_detail(request, pk):
    article = get_object_or_404(Article, pk=pk)
    return render(request, 'articles/detail.html', {'article': article})

# API view
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def api_article_list(request):
    articles = Article.objects.all()
    data = [{'id': a.id, 'title': a.title} for a in articles]
    return Response(data)
```

### URL設定

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.article_list, name='article_list'),
    path('article/<int:pk>/', views.article_detail, name='article_detail'),
    path('api/articles/', views.api_article_list, name='api_article_list'),
]
```

## Django Rest Framework (DRF)

APIの構築にはDjango Rest Frameworkが便利です：

```python
from rest_framework import serializers, viewsets
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'published_date', 'author']

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
```

## まとめ

PythonとDjangoの組み合わせは、迅速で堅牢なWebアプリケーション開発を可能にします。
豊富な機能とアクティブなコミュニティにより、効率的な開発が実現できます。
