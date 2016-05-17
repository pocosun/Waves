"use strict";

$(document).ready(function() {
    
    function sendAjax(action, data) {
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: function(result, status, xhr) {
                window.location = result.redirect;
            },
            error: function(xhr, status, error) {
                var messageObj = JSON.parse(xhr.responseText);
            
                console.log(messageObj.error);

                $(".error").html("Error: " + messageObj.error);
                $(".error").removeClass("hidden");
            }
        });        
    }


    $("#signupSubmit").on("click", function(e) {
        e.preventDefault();
    
        if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
            $(".error").html("All fields required!");
            $(".error").removeClass("hidden");
            return false;
        }
        
        if($("#pass").val() !== $("#pass2").val()) {
            $(".error").html("Passwords do not match!");
            $(".error").removeClass("hidden");
            return false;           
        }
        
        sendAjax($("#signupForm").attr("action"), $("#signupForm").serialize());
        
        return false;
    });

    $("#loginSubmit").on("click", function(e) {
        e.preventDefault();
    
        if($("#user").val() == '' || $("#pass").val() == '') {
            $(".error").html("Username or password is empty");
            $(".error").removeClass("hidden");
            return false;
        }

        sendAjax($("#loginForm").attr("action"), $("#loginForm").serialize());

        return false;
    });

});