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
 /* global Firebase google */
(function() {
  /**
   * Creates an Array of DOM nodes that match the selector
   * @param selector {string} CSS selector - selector to match against
   * @return {array} Array of DOM nodes
   */
  function getDomNodeArray(selector) {
    var nodes = Array.prototype.slice.apply(document.querySelectorAll(selector));
    if (!nodes) {
      nodes = [];
    }
    return nodes;
  }

  /*
  Adding guests
   */
  var newGuest = document.querySelector('input.new-guest');
  var people = document.querySelector('.attendees');
  var guestsDisplay = document.querySelector('.card-detail-actual.guests');
  var addButton = document.querySelector('#add-attendee');
  newGuest.onkeydown = function(evt) {
    if (evt.keyIdentifier === 'Enter') {
      let enteredPerson = document.createElement('div');
      let enteredPerson2 = document.createElement('div');
      let deletePerson = document.createElement('button');
      deletePerson.innerHTML = '-';
      deletePerson.parent = enteredPerson;

      deletePerson.onclick = function() {
        let dataAttr = this.parent.getAttribute('data-guest');
        let guestToRemove = document.querySelector(`[data-guest="${dataAttr}"]`);
        people.removeChild(this.parent);
        // remove from card-detail preview
        guestsDisplay.removeChild(guestToRemove);
      };
      enteredPerson.innerHTML = newGuest.value;
      // for easy access later
      enteredPerson.setAttribute('data-guest', newGuest.value);
      enteredPerson.appendChild(deletePerson);
      // add to card-detail preview
      enteredPerson2.innerHTML = newGuest.value;
      // for easy access later
      enteredPerson2.setAttribute('data-guest', newGuest.value);
      guestsDisplay.appendChild(enteredPerson2);

      people.appendChild(enteredPerson);
      newGuest.value = '';
    }
  };
  addButton.onclick = function(event) {
    event.preventDefault();
    let enteredPerson = document.createElement('div');
    let enteredPerson2 = document.createElement('div');
    let deletePerson = document.createElement('button');
    deletePerson.innerHTML = '-';
    deletePerson.parent = enteredPerson;

    deletePerson.onclick = function(event) {
      event.preventDefault();
      let dataAttr = this.parent.getAttribute('data-guest');
      let guestToRemove = document.querySelector(`[data-guest="${dataAttr}"]`);
      people.removeChild(this.parent);
      // remove from card-detail preview
      guestsDisplay.removeChild(guestToRemove);
    };
    enteredPerson.innerHTML = newGuest.value;
    // for easy access later
    enteredPerson.setAttribute('data-guest', newGuest.value);
    enteredPerson.appendChild(deletePerson);
    // add to card-detail preview
    enteredPerson2.innerHTML = newGuest.value;
    // for easy access later
    enteredPerson2.setAttribute('data-guest', newGuest.value);
    guestsDisplay.appendChild(enteredPerson2);

    people.appendChild(enteredPerson);
    newGuest.value = '';
  };

  /*
  Adding functionality to hide/show guest in card-detail preview
   */
  var attendeesCheckbox = document.getElementById('attendees-list');
  var guestsDisplayContainer = document.querySelector('.card-detail.guests');
  attendeesCheckbox.onclick = function() {
    if (this.checked === true) {
      guestsDisplayContainer.classList.remove('hidden');
    } else {
      guestsDisplayContainer.classList.add('hidden');
    }
  };

  /*
  class="model model-*" Refer to inputs by the name after class model-*
   */
  function Model() {
    var self = this;

    function Binding(elem, value) {
      elem = elem || null;
      value = value || null;

      this.elem = elem;
      this.value = value;
      this.hasChanged = false;
      this.oninput = function() {};
      this.onchange = function() {};
    }

    // pulls values from elems of class="model model-*" to create Model's raw info and set up 1-way binding
    getDomNodeArray('.model').forEach(function(elem) {
      elem.classList.forEach(function(className) {
        var possiblyMatch = className.match(/model\-/g);
        if (possiblyMatch) {
          // create the Model value
          var name = className.slice(6);
          var value = elem.value;

          self[name] = self[name] || new Binding(elem, value);
          elem.binding = elem.binding || self[name];

          // bind data oninput
          elem.oninput = function() {
            self[name].hasChanged = true;
            self[name] = self[name] || new Binding(elem, value);
            self[name].value = elem.value;

            // for callbacks
            self[name].oninput();
          };

          // bind data onchange
          elem.onchange = function() {
            // self[name].hasChanged = true;
            // self[name] = self[name] || new Binding(elem, value);
            // self[name].value = elem.value;

            // for callbacks
            self[name].onchange();
          };
        }
      });
    });
  }

  /*
  To create a placeholder effect. Assumes that display element starts with 'placeholder' class
   */
  function displayWithPlaceholder(inputBinding, displayElem, placeholder) {
    if (displayElem.classList.contains('placeholder')) {
      displayElem.classList.remove('placeholder');
    }
    if (inputBinding.value === '') {
      inputBinding.value = placeholder;
      // let the model know that input has gone back to default
      inputBinding.hasChanged = false;

      displayElem.classList.add('placeholder');
    }
    displayElem.innerHTML = inputBinding.value;
  }

  /*
  Set up Google Maps autocomplete location input
   */
  var input = document.getElementById('location');
  var whereDisplay = document.querySelector('.card-detail-actual.where');
  var autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.addListener('place_changed', () => {
    let place = autocomplete.getPlace();
    displayWithPlaceholder({
      value: place.formatted_address
    }, whereDisplay, 'Location');
  });

  /*
  Creating Model
   */
  var model = new Model();

  // validation methods
  var validateTitle = function() {
    return model.title.hasChanged;
  };
  var validateDescription = function() {
    return model.type.hasChanged;
  };
  var validateHost = function() {
    return model.host.hasChanged;
  };
  var validateLocation = function() {
    return model.location.hasChanged;
  };
  var validateStartDatetime = function() {
    return model.starttime.elem.value;
  };
  var validateEndDatetime = function() {
    return model.endtime.elem.value;
  };
  var validateAttendees = function() {
    if (people.length > 0) {
      return true;
    }
    return false;
  };
  var validateAttendeeEmails = function() {
    var areReal = false;
    var emailRegex = new RegExp('^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$');
    people.forEach(function(guest, index) {
      var result = emailRegex.exec(guest.value);
      if (result && result.index === 0) {
        if (index === 0) {
          areReal = true;
        } else {
          areReal = areReal && true;
        }
      } else {
        areReal = areReal && false;
      }
    });
    return areReal;
  };

  // Update the view oninput
  model.title.oninput = function() {
    var titleDisplay = document.querySelector('.title-display');
    displayWithPlaceholder(model.title, titleDisplay, 'Untitled Event');
  };

  model.type.oninput = function() {
    var typeDisplay = document.querySelector('.card-detail-actual.what');
    displayWithPlaceholder(model.type, typeDisplay, 'Description');
  };

  model.host.oninput = function() {
    var hostDisplay = document.querySelector('.card-detail-actual.who');
    displayWithPlaceholder(model.host, hostDisplay, 'Host');
  };

  model.starttime.oninput = function() {
    var startTimeDisplay = document.querySelector('.card-detail-actual.starttime');
    displayWithPlaceholder(model.starttime, startTimeDisplay, 'Start Time');
  };

  model.endtime.oninput = function() {
    var endTimeDisplay = document.querySelector('.card-detail-actual.endtime');
    displayWithPlaceholder(model.endtime, endTimeDisplay, 'End Time');
  };

  function displayValid(model) {
    model.elem.classList.remove('invalid');
    model.elem.classList.add('valid');

    let validationIcon = model.elem.parentElement.previousElementSibling;
    if (validationIcon.classList.contains('material-icons')) {
      validationIcon.textContent = 'checkmark';
    }
  }
  function displayInvalid(model) {
    model.elem.classList.remove('valid');
    model.elem.classList.add('invalid');

    let validationIcon = model.elem.parentElement.previousElementSibling;
    if (validationIcon.classList.contains('material-icons')) {
      validationIcon.textContent = 'error';
    }
  }
  // update the view onchange
  model.title.onchange = function() {
    if (validateTitle()) {
      displayValid(this);
    } else {
      displayInvalid(this);
    }
  };

  model.type.onchange = function() {
    if (validateDescription()) {
      displayValid(this);
    } else {
      displayInvalid(this);
    }
  };

  model.host.onchange = function() {
    if (validateHost()) {
      displayValid(this);
    } else {
      displayInvalid(this);
    }
  };

  model.location.onchange = function() {
    if (validateLocation()) {
      displayValid(this);
    } else {
      displayInvalid(this);
    }
  };

  model.starttime.onchange = function() {
    if (validateStartDatetime()) {
      displayValid(this);
    } else {
      displayInvalid(this);
    }
  };

  model.endtime.onchange = function() {
    if (validateEndDatetime()) {
      displayValid(this);
    } else {
      displayInvalid(this);
    }
  };

  function validate() {
    var self = this;
    var allGood = false;
    var errorMessage = 'Please correct the following errors: <br>';
    var people = getDomNodeArray('.people>div');

    var validations = [{
      errorMessage: 'Please include an event title.',
      validationMethod: validateTitle
    }, {
      errorMessage: 'Please include an event description.',
      validationMethod: validateDescription
    }, {
      errorMessage: 'Please include at least one attendee.',
      validationMethod: validateAttendees
    }, {
      errorMessage: 'Please include a valid email addresses.',
      validationMethod: validateAttendeeEmails
    }];

    validations.forEach(function(val, index) {
      if (val.validationMethod(self)) {
        if (index === 0) {
          allGood = true;
        } else {
          allGood = allGood && true;
        }
      } else {
        allGood = allGood && false;
        errorMessage = errorMessage + val.errorMessage + '<br>';
      }
    });
    errorMessage = errorMessage.trim();

    return {
      isValid: allGood,
      errorMessage: errorMessage
    };
  }

  var createButton = document.querySelector('button#create');
  createButton.onclick = function() {
    var validState = validate();

    if (!validState.isValid) {
      var errorMessage = document.querySelector('.error-message');
      errorMessage.innerHTML = validState.errorMessage;
    } else {
      alert('Valid form. Thanks for submitting!');
    }
  };
})();
