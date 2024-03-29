const express = require('express')


const db = require('../data/database');
const { render } = require('ejs');

const router = express.Router();

router.get('/', function(req,res){
 res.redirect('/posts');
});

router.get('/posts',async function(req,res){
    const query = `
    SELECT posts.*, authors.name AS author_name FROM posts
    INNER JOIN authors ON posts.author_id = authors.id
    `;
    const [posts] = await db.query(query);
    res.render('posts-list',{ posts: posts });
});

router.get('/new-post', async function(req,res){
   const [authors] = await db.query('SELECT * FROM authors');
    res.render('create-post', { authors: authors });
});

router.post('/posts',async function(req,res){
   const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
   ];
    await db.query('INSERT INTO posts (title,summary, body, author_id) VALUES (?)', [data
    ]);
    res.redirect('/posts');//포스트 저장 할 때마다 post 화면으로 돌아감
})

router.get('/posts/:id', async function(req, res){
    const query = `
    SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts
    INNER JOIN authors ON posts.author_id = authors.id
    WHERE posts.id = ?
    `  
    
   const [posts] = await db.query(query, [req.params.id]);
   
   if(!posts || posts.length === 0 ){
     return res.status(404).render('404');
   }
   
   const postData = {
     ...posts[0],//모든 당일 객체를 불러옴
        date: posts[0].date.toISOString(), 
        humanReadableDate: posts[0].date.toLocaleDateString('ko-KO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }),
   };
    res.render('post-detail', { post: postData });
});

router.get('/posts/:id/edit', async function(req, res){
    const query = `
    SELECT * FROM posts WHERE id= ?
    `;
    
   const [posts] = await db.query(query, [req.params.id])

   if(!posts || posts.length === 0 ){
    return res.status(404).render('404');
  }


    res.render('update-post', {post: posts[0]})
});

router.post('/posts/:id/edit', async function(req,res){
    const query = `
    UPDATE posts SET title = ?, summary = ?, body = ?
    WHERE id = ?
    `;
    await db.query(query, [
        req.body.title, 
        req.body.summary, 
        req.body.content, 
        req.params.id,
    ]);

    res.redirect('/posts');
});

router.post('/posts/:id/delete', async function(req,res){

await db.query('DELETE FROM posts WHERE id =?', [req.params.id])// id 에 매칭하는 것을 삭제

res.redirect('/posts');
});

module.exports = router;
