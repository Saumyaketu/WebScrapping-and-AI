<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index() {
        return response()->json(Article::all());
    }

    public function show($id) {
        return response()->json(Article::find($id));
    }
    
    public function update(Request $request, $id) {
        $article = Article::findOrFail($id);
        $article->update($request->all());
        return response()->json(['message' => 'Updated successfully']);
    }
}