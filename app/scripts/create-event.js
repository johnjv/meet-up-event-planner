var APP = (function() {
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
    newGuest.onkeydown = function(evt) {
        if (evt.keyIdentifier === "Enter") {
            var enteredPerson = document.createElement('div');
            var deletePerson = document.createElement('button');
            deletePerson.innerHTML = "-";
            deletePerson.parent = enteredPerson;

            deletePerson.onclick = function() {
                people.removeChild(this.parent);
            };
            enteredPerson.innerHTML = newGuest.value;
            enteredPerson.value = newGuest.value; // for easy access later
            enteredPerson.appendChild(deletePerson);

            people.appendChild(enteredPerson);
            newGuest.value = "";
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
        }

        // pulls values from elems of class="model model-*" to create Model's raw info and set up 1-way binding
        getDomNodeArray('.model').forEach(function(elem) {
            elem.classList.forEach(function(className) {
                var possiblyMatch = className.match(/model\-/g);
                if (possiblyMatch) {
                    // create the Model value
                    var name = className.slice(6);
                    var value = elem.value;

                    // set default values
                    if (name.indexOf("Month") > -1) {
                        value = value - 1;
                    } else if (name.indexOf("Time" > -1)) {
                        value = value || '00:00';
                    }

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
                }
            });
        });
    };

    /*
    To create a placeholder effect. Assumes that display element starts with 'placeholder' class
     */
    function displayWithPlaceholder(inputBinding, displayElem, placeholder) {
        if (displayElem.classList.contains('placeholder')) {
            displayElem.classList.remove('placeholder');
        };
        if (inputBinding.value === "") {
            inputBinding.value = placeholder;
            // let the model know that input has gone back to default
            inputBinding.hasChanged = false;

            displayElem.classList.add('placeholder');
        }
        displayElem.innerHTML = inputBinding.value;
    };
    var model = new Model();

    // Update the view oninput
    model.title.oninput = function() {
        var titleDisplay = document.querySelector('.title-display');
        displayWithPlaceholder(model.title, titleDisplay, "Untitled Event");
    };

    model.type.oninput = function() {
        var typeDisplay = document.querySelector('.card-detail-actual.what');
        displayWithPlaceholder(model.type, typeDisplay, "Description");
    };

    model.host.oninput = function() {
        var hostDisplay = document.querySelector('.card-detail-actual.who');
        displayWithPlaceholder(model.host, hostDisplay, "Host");
    };

    model.starttime.oninput = function() {
        var startTimeDisplay = document.querySelector('.card-detail-actual.starttime');
        displayWithPlaceholder(model.starttime, startTimeDisplay, "Start Time");
    };

    model.endtime.oninput = function() {
        var endTimeDisplay = document.querySelector('.card-detail-actual.endtime');
        displayWithPlaceholder(model.endtime, endTimeDisplay, "End Time");
    };


    function validate() {
        var self = this;
        var allGood = false;
        var errorMessage = "Please correct the following errors: <br>";
        var people = getDomNodeArray('.people>div');

        var validations = [{
            errorMessage: "Please include a title.",
            validationMethod: function() {
                return model.title.hasChanged;
            }
        }, {
            errorMessage: "Please include a description.",
            validationMethod: function() {
                return model.description.hasChanged;
            }
        }, {
            errorMessage: "Please include guests.",
            validationMethod: function() {
                if (people.length > 0) {
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            errorMessage: "Please include valid email addresses.",
            validationMethod: function() {
                var areReal = false;
                var emailRegex = new RegExp("^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$");
                people.forEach(function(guest, index) {
                    var result = emailRegex.exec(guest.value);
                    if (result && result['index'] === 0) {
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
            }
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
        }
    };

    var createButton = document.querySelector('button#create');
    createButton.onclick = function() {
        var validState = validate();

        if (!validState.isValid) {
            var errorMessage = document.querySelector('.error-message');
            errorMessage.innerHTML = validState.errorMessage;
        } else {
            alert("Valid form. Thanks for submitting!");
        }
    };


    var input = document.getElementById('location');
    var whereDisplay = document.querySelector('.card-detail-actual.where');
    var autocomplete = new google.maps.places.Autocomplete(input);
    
    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();
      displayWithPlaceholder({
          value: place.formatted_address
      }, whereDisplay, "Location");
    });
})();
