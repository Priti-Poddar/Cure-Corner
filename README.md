# Cure-Corner
## Table of contents
<div>
    <ul>
     <li><a href="https://github.com/Priti-Poddar/Cure-Corner/blob/main/README.md#introduction">Introduction</a></li>
     <li><a href="https://github.com/Priti-Poddar/Cure-Corner/blob/main/README.md#demo">Demo</a></li>
     <li><a href="https://github.com/Priti-Poddar/Cure-Corner/blob/main/README.md#run">Run</a></li>
     <li><a href="https://github.com/Priti-Poddar/Cure-Corner/blob/main/README.md#technology">Technology</a></li>
     <li><a href="https://github.com/Priti-Poddar/Cure-Corner/blob/main/README.md#features">Features</a></li>
    </ul>
</div>

## Introduction
<div>
<p>Cure-Corner is a comprehensive web application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js) that allows users to book doctor’s appointments and order medicines with ease.</p>
</div>

## Demo
<div>
  <br>
  <p>Home Page</p>
  <img src="https://github.com/user-attachments/assets/df097987-0b97-4779-8c22-46e953316577">
<br><br>
  <p>Find Doctors Page </p>

  <img src="https://github.com/user-attachments/assets/77d0bceb-886d-43e2-be02-91c5ce06a138">
<br>  <br>
  <p>The application is deployed to Render and can be accessed through the following link:</p>
  <a href="diptimedical.com">Cure-Corner</a>

<p>In order to access the admin panel on "/admin" you need to provide the admin email and password.</p>
</div>

## Run
<div>
<p>To run this application, you have to set your own environmental variables. For security reasons, some variables have been hidden from view and used as environmental variables with the help of dotenv package. Below are the variables that you need to set in order to run the application:</p>

<p>ATLASDB_URL: this is the connection string of your MongoDB Atlas database.</p>

<p>SECRET: a secret message for the session. You can use any string here.</p>

<p>KEY_ID, KEY_SECRET: the razorpay package is used to process payment in the checkout route. To get these, you should set up a razorpay account and put your private API key here.</p>

<p>CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET: Cloudinary is a cloud-based platform that helps store, manage and deliver images and videos for websites and mobile apps. To get these, you should set up a Cloudinary account and put your private API key here </p>

<p>PHONEPE_MERCHANT_ID, SALT_KEY, PHONE_PE_HOST_URL, SALT_INDEX: To get these, you should go to this <a href="https://developer.phonepe.com/">documentation</a> and put those API key here.</p>

<p>ADMIN_COOKIE_NAME, ADMIN_COOKIE_PASSWORD: the cookie name and password used in the AdminBro authentication method. You can put any strings here.</p>

<p>After you've set these environmental variables in the .env file at the root of the project, you need to navigate to the "init" folder and run "node index.js" to fill your empty MongoDB Atlas database.</p>

<p>Now you can run "npm start" in the terminal and the application should work.</p>
</div>

## Technology

<div>
<p>The website is built with:</p>
  
<ul>
<li>Node.js version 20.11.1</li>
<li>MongoDB version 8.3.2</li>
<li>Express version 4.19.2</li>
<li>ejs version 3.1.10</li>
<li>Bootstrap version 5.3.3</li>
<li>FontAwesome version 6.5.2</li>
<li>Cloudinary: used to store listing images</li>
<li>Passport: used for authentication</li>
<li>joi: used for schema validation</li>
<li>csv-parser: used for parsing csv files</li>
<li>Express Validator: used for form validation</li>
</ul>
</div>

## Features
<div>
   <p>Users can do the following:</p>
 <ul>
<li>Create an account, login or logout</li>
<li>Browse and book appointments with doctors based on availability and specialty.</li>
<li>user can apply as a doctor</li>
<li>Browse and Order available medicines and products added by the admin with home delivery options.</li>
<li>Add products to the shopping cart</li>
<li>Delete products from the shopping cart</li>
<li>Display the shopping cart</li>
<li>To checkout, a user must be logged in</li>
<li>Checkout information is processed using razorpay, phonepe and the payment is send to the admin & cash on delivery also available</li>
<li>The profile contains user informations, all the orders a user has made, all payments etc and user can manage the profile </li>
</ul>
<p> Admins can do the following:</p>
<ul>
<li>Login or logout to the admin panel</li>
<li>View all the information stored in the database.</li>
<li>They can view/add/edit/delete orders, users, products and categories.</li>
<li>They can upload csv file for bulk addition to the inventory</li>
<li>The cart model cannot be modified by an admin because a cart is either modified by the logged in user before the purchase or deleted after the purchase.</li>
</ul>  
    
Feel free to explore, contribute, or use this as a reference for your own projects!
</div>


