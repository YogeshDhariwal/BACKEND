# Backend creation 
The backend creation is done with the help of chai and code youtube channel. Model that we used to create the backend
-[Model Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDKzj?origin=share)

prettier is used to make code same as your other colleague such as usage of ; and spaces
  npm i -D prettier  
used to install it 

# HTTP 
HTTP (HyperText Transfer Protocol) is a communication protocol that defines how data is sent and received between a client and a server.
# what is Http headers?
Metadata ---> key - value   sent along with request and response

# what header do?
 caching , authentication, state management(login,logout)

- Request Headers --> from client

- Response Headers --> from server

 - Representation Headers --> encoding/compression

 - Payload Headers  --> data

 # MOST COMMON HEADER 
- ACCEPT :Application /json 
- User : Agent(like safari,postman)
- Authorization : Bearrer_JWT TOKEN
- Content-Type : image,file
- Cookie :{key,expiry}
- Cache-Control : {expiry time} etc.

# HTTP Methods
Basic set of operation that can be used to interact with server
- GET : Retrieve a resource(data)
- POST : Interact with resources (mostly add)
- PUT : Replace a resource
- DELETE : Remove a resource
- PATCH : Change part of a resource
- HEAD : No message body (response header only)
- OPTION : What operation are available 
- TRACE : Loopback test (get some data)

# HTTP Status Code
 - 1** - Infromational
 - 2** - Success
 - 3** - Redirection
 - 4** - Client error
 - 5** - Server error
 - 100 continue , 102 processing
 - 200 ok , 201 created, 202 accepted
 - 307 temporary redirect , 308 permanent redirect
 - 400 Bad request , 401 unauthorized , 402 - Payment reqired , 404 Not found
 - 500 Internal Server Error , 504 - Gateway time out


