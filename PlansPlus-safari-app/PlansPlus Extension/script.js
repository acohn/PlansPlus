document.addEventListener("DOMContentLoaded", function(event) {
                          var inject = document.createElement("script");
                          inject.src = safari.extension.baseURI + "plansplus.user.js";
                          document.head.appendChild(inject);
                          })
