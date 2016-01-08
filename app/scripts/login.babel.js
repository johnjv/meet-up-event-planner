/**
 *
 *  Meet-Up Event Planner
 *  Copyright 2015 Justin Varghese John All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

 /* eslint-env browser */
'use strict';

var firebase = new Firebase("https://meet-up-event-planner.firebaseio.com");

let emailInput = document.querySelector('input[type="email"]');
let passwordInput = document.querySelector('input[type="password"]');
let submit = document.querySelector('button[type="submit"]');


submit.onclick = function() {
  event.preventDefault();
  firebase.authWithPassword({
    email    : emailInput.value,
    password : passwordInput.value
  }, function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
      window.location.href = '/create-event.html';
    }
  });
};
