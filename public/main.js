$("#zhuce").on("click", (e) => {
  e.preventDefault();
  $.ajax({
    method: "GET",
    url: "/main.js",
    contentType: "text/javascript;charset=UTF-8",
  }).then(
    () => {
      location.href = "/register.html";
    },
    () => {}
  );
});
$("#denglu").on("click", (e) => {
  e.preventDefault();
  $.ajax({
    method: "GET",
    url: "/main.js",
    contentType: "text/javascript;charset=UTF-8",
  }).then(
    () => {
      location.href = "/sign_in.html";
    },
    () => {}
  );
});
