/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

// book Model
var mongoose = require('mongoose');
mongoose.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true });
var bookSchema = new mongoose.Schema({
  title: String,
  comments: [String]
});
var Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, (err, books) => {
        if (err) return res.send(err);
        res.json(books.map(book => {
          return {
            _id: book.id,
            title: book.title,
            commentcount: book.comments.length
          }
        }));
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (title == '') return res.sendStatus(400);
      let book = new Book({ title: title, comments: [] });
      book.save((err, book) => {
        if (err) return res.send(err);
        res.json({ _id: book.id, title: book.title })
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, err =>{
        if (err) return res.send(err);
        res.send('complete delete successful');
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, (err, book) => {
        if (err) return res.send('no book exists');
        res.json({
          _id: bookid,
          title: book.title,
          comments: book.comments
        });
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      Book.findById(bookid, (err, book) => {
        if (err) return res.send('no book exists');
        book.comments.push(comment);
        book.save((err,book) => {
          if (err) return res.send(err);
          res.json({
          _id: bookid,
          title: book.title,
          comments: book.comments
          });
        })
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndDelete(bookid, (err, book) => {
        if (err) return res.send('no book exists');
        res.send('delete successful');
      });
    });
  
};
