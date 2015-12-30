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

'use strict';

let firstPasswordInput = document.querySelector('input[name="password"]');
let secondPasswordInput = document.querySelector('input[name="repeat-password"]');
let submit = document.querySelector('button[type="submit"]');

/*
I'm using this IssueTracker to help me format my validation messages.
 */
class IssueTracker {
  constructor() {
    this.issues = [];
  }

  addIssue(issue) {
    this.issues.push(issue);
  }

  getIssues() {
    let message = "";
    switch (this.issues.length) {
      case 0:
        // do nothing because message is already ""
        break;
      case 1:
        message = "Please correct the following issue:\n" + this.issues[0];
        break;
      default:
        message = "Please correct the following issues:\n" + this.issues.join("\n");
        break;
    }
    return message;
  }

}

submit.onclick = function () {
  /*
  Don't forget to grab the input's .value!
   */
  let firstPassword = firstPasswordInput.value;
  let secondPassword = secondPasswordInput.value;

  /*
  Make an issue tracker for each input because some validation messages should
  end up on the first one, some on the second.
   */
  let firstInputIssuesTracker = new IssueTracker();
  let secondInputIssuesTracker = new IssueTracker();

  /*
  This steps through all of the requirements and adds messages when a requirement fails.
  Just checks the first password because the second should be the same when it runs.
   */
  function checkRequirements() {
    if (firstPassword.length < 8) {
      firstInputIssuesTracker.addIssue("fewer than 8 characters");
    } else if (firstPassword.length > 100) {
      firstInputIssuesTracker.addIssue("greater than 100 characters");
    }

    if (!firstPassword.match(/[\!\@\#\$\%\^\&\*]/g)) {
      firstInputIssuesTracker.addIssue("missing a symbol (!, @, #, $, %, ^, &, *)");
    }

    if (!firstPassword.match(/\d/g)) {
      firstInputIssuesTracker.addIssue("missing a number");
    }

    if (!firstPassword.match(/[a-z]/g)) {
      firstInputIssuesTracker.addIssue("missing a lowercase letter");
    }

    if (!firstPassword.match(/[A-Z]/g)) {
      firstInputIssuesTracker.addIssue("missing an uppercase letter");
    }

    let illegalCharacterGroup = firstPassword.match(/[^A-z0-9\!\@\#\$\%\^\&\*]/g)
    if (illegalCharacterGroup) {
      illegalCharacterGroup.forEach(function (illegalChar) {
        firstInputIssuesTracker.addIssue("includes illegal character: " + illegalChar);
      });
    }
  };

  /*
  Here's the first validation check. Gotta make sure they match.
   */
  if (firstPassword === secondPassword && firstPassword.length > 0) {
    /*
    They match, so make sure the rest of the requirements have been met.
     */
    checkRequirements();
  } else {
    secondInputIssuesTracker.addIssue("Passwords must match!");
  }

  /*
  Get the validation message strings after all the requirements have been checked.
   */
  let firstInputIssues = firstInputIssuesTracker.getIssues()
  let secondInputIssues = secondInputIssuesTracker.getIssues()

  /*
  Let input.setCustomValidity() do its magic :)
   */
  firstPasswordInput.setCustomValidity(firstInputIssues);
  secondPasswordInput.setCustomValidity(secondInputIssues);

  /*
  You would probably replace this with a POST message in a real app.
   */
  if (firstInputIssues.length + secondInputIssues.length === 0) {
    alert("Password change successful!");
  }
};
