// ----------------------------------------------
// TCSS 460: Autumn 2023
// Backend REST Service Module
// ----------------------------------------------
// Express is a Node.js web application framework
// that provides a wide range of APIs and methods
// Express API Reference:
// https://expressjs.com/en/resources/middleware/cors.html

// ----------------------------------------------
// retrieve necessary files (express and cors)
const express = require("express");
const cors = require("cors");
// retrieve the MySQL DB Configuration Module
const dbConnection = require("./config");
// use this library for parsing HTTP body requests
var bodyParser = require("body-parser");

// ----------------------------------------------
// (A)  Create an express application instance
//      and parses incoming requests with JSON
//      payloads
// ----------------------------------------------
var app = express(express.json);

// Import the authentication middleware
const { authenticateJWT, authorizeRole } = require('./authMiddleware');

//WEBSERVICE #2: Post Service
// handles manipulation of user posts
// Methods:
// POST: Create a new post
// GET: Retrieve post details
// PATCH: Edit an existing post
// DELETE: Remove a post

// ----------------------------------------------
// (1) create a new post
// Note: post id is auto incremented so no need to pass in, 
// upvotes, and viewcount are set to default values(0)
// URI: http://localhost:port/posts

// app.post("/posts", (request, response) => {
//     const sqlQuery = "INSERT INTO posts VALUES (?);";
//     const values = [
//       request.body.subforumid,
//       request.body.userid,
//       request.body.title,
//       request.body.content,
//       request.body.postdate
//     ];
  
//     dbConnection.query(sqlQuery, [values], (err, result) => {
//       if (err) {
//         return response
//           .status(400)
//           .json({ Error: "Failed: post was not added." });
//       }
//       return response
//         .status(200)
//         .json({ Success: "Successful: post was added!." });
//     });
//   });

  // app.post("/posts", authenticateJWT, authorizeRole([1,2,3,4]), (request, response) => {
  //   const sqlQuery = "INSERT INTO posts VALUES (?);";
  //   const values = [
  //     request.body.subforumid,
  //     request.body.userid,
  //     request.body.title,
  //     request.body.content,
  //     request.body.postdate
  //   ];
  
  //   dbConnection.query(sqlQuery, [values], (err, result) => {
  //     if (err) {
  //       return response
  //         .status(400)
  //         .json({ Error: "Failed: post was not added." });
  //     }
  //     return response
  //       .status(200)
  //       .json({ Success: "Successful: post was added!." });
  //   });
  // });

  //All user type can make a post.
  app.post("/posts", authenticateJWT, (request, response) => {
    // You might not need to get the userid from the request body as it can be extracted from the token
    // const userid = request.user.userId; // Extracted from the JWT after authentication
    
    // Ensure you are inserting into the correct columns and that they match your database schema
    const sqlQuery = "INSERT INTO posts (SubForumId, UserId, Title, Content, PostDate) VALUES (?, ?, ?, ?, ?);";
    const values = [
      request.body.subforumid,
      request.user.userId, // Use userId from JWT
      request.body.title,
      request.body.content,
      new Date() // You can set the postdate to the current time if that's what you want
    ];
  
    dbConnection.query(sqlQuery, values, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: post was not added." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: post was added!", postId: result.insertId });
    });
  });
  

  
  // ----------------------------------------------
  // (2) retrive the information for a specific post
  // root URI: http://localhost:port/posts/:postid
  app.get("/posts/:postid", (request, response) => {
    const postid = request.params.postid;
    const sqlQuery = "SELECT * FROM posts WHERE postid = '" + postid + "';";
    dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Error in the SQL statement. Please check." });
      }
      response.setHeader("postId", postid); // send a custom
      return response.status(200).json(result);
    });
  });
  
  
  // ----------------------------------------------
  // (3) update the info for a post
  app.put("/posts/:postid", (request, response) => {
    const postid = request.params.postid;
    
    const sqlQuery = `UPDATE users SET content = ?
      WHERE postid = ? ;`;
    const values = [
      request.body.content
    ];
  
    console.log(sqlQuery); // for debugging purposes:
    dbConnection.query(sqlQuery, [...values, postid], (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: Post was not edited." });
      }
      return response
        .status(200)
        .json({ Success: "Successful: Post was edited!." });
    });
  });
  
  // ----------------------------------------------
  // (4) Delete a post by post id
  // make sure we designate username to be unique in database
  app.delete("/posts/:postid", (request, response) => {
    const postid = request.params.postid;
    const sqlQuery = "DELETE FROM posts WHERE postid = ? ; ";
    dbConnection.query(sqlQuery, postid, (err, result) => {
      if (err) {
        return response
          .status(400)
          .json({ Error: "Failed: post was not deleted" });
      }
      return response
        .status(200)
        .json({ Success: "Succcessful: post was deleted!" });
    });
  });

  
module.exports = app;