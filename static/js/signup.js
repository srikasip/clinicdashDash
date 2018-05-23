$(document).ready(function(){
  if(sessionStorage.uid){
    window.location.href = "/dash";
  }
  
  SetButtonClick();
});

function SetButtonClick(){
  $("#signupBtn").click(function(){
      //Validate Entries
      returnData = {}
      returnData["name"] = $("#txtName").val().trim();
      returnData["specialty"] = $("#txtSpecialty").val().trim();
      returnData["zip"] = $("#txtZip").val().trim();
      returnData["email"] = $("#txtEmail").val().trim();
      returnData["uName"] = $("#txtUsername").val().trim();
      returnData["pwd"] = $("#txtPassword").val().trim();

      if ([returnData["name"], returnData["specialty"], returnData["zip"], returnData["email"], returnData["uName"], returnData["pwd"]].indexOf("") >= 0) {
        $("#validationNotice").css("display", "block");
      }
      else{
        $("#validationNotice").css("display", "none");
        $.ajax({
          url: '/doSignup',
          data: JSON.stringify({'profileData': returnData}),
          contentType: "application/json",
          type: "POST"
        })
          .done(function(data) {
            if (data["user_id"]>=1){
              window.location.href = "/login";
            }
            else{
              $("#validationNotice").html("Looks like this username or email already exists. Are you a user?");
              $("#validationNotice").css("display", "block");
            }
          })
          .fail(function(data) {
            console.log( "error" );
          })
          .always(function(data, status) {
          });
      }
  });


  $("#loginBtn").click(function(){
      //Validate Entries
      returnData = {}
      returnData["uName"] = $("#txtUsername").val().trim();
      returnData["pwd"] = $("#txtPassword").val().trim();

      if ([returnData["uName"], returnData["pwd"]].indexOf("") >= 0) {
        $("#validationNotice").html("**Please fill out both fields.");
        $("#validationNotice").css("display", "block");
      }
      else{
        $("#validationNotice").css("display", "none");
        $.ajax({
          url: '/doLogin',
          data: JSON.stringify({'loginData': returnData}),
          contentType: "application/json",
          type: "POST"
        })
          .done(function(data) {
            console.log( "success" );
            if(data["user_id"]>0){
              sessionStorage.uid = data["user_id"];
              window.location.href = "/dash";
            }
            else{
              $("#validationNotice").html("Username or Password is incorrect");
              $("#validationNotice").css("display", "block");
            }
          })
          .fail(function(data) {
            console.log( "error" );
          })
          .always(function(data, status) {
          });
      }
  });
}