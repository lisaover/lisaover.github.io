---
title: "Boggle Game"
excerpt: "This servlet version of Boggle implements the MVC design pattern using a Java servlet as controller, a Java Beans class for the data model, 
and the XML version of JSP (jspx) to generate the views.<br/><img src='/images/Boggle Game.png'>"
collection: portfolio
---

<a href="https://github.com/lisaover/DuqWebSystems">View Project on GitHub</a>

The Boggle folder contains a servlet version of Boggle that implements the MVC design pattern using a Java servlet as controller, a Java Beans class for the data model, 
and the XML version of JSP (jspx) to generate the views. 

When a user visits the servlet (via GET) and a session does not already exist, the servlet returns an HTML login page that asks for a username (no password). Once the 
user has logged in and a session is established, the servlet returns a Boggle HTML page with random letters appearing on the board that are generated by the servlet. 
The JavaScript run by the page stores every word the user enters in the Words Found textarea, and when the Score Me button is clicked default processing occurs, which means 
that the data on the page is submitted (using the POST method) to the servlet. The servlet then scores the user's words and returns an HTML page with their percentage of words 
found for this game and their percentage overall (total number of words found divided by total number of words on boards they played). This user data is saved to a file and 
retained between server restarts. When the New Game button is pressed, the server generates and displays a new randomly generated game board. This servlet avoids threading 
problems by using synchronization. This servlet implements URL rewriting so it works even if the user has disabled cookies.