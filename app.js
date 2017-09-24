const form = document.querySelector('#registrar');
const inviteInput = form.querySelector('input');
const ul = document.querySelector('#invitedList');
const main = document.querySelector('.main');

const div = document.createElement('div');
const filterLabel = document.createElement('label');
const filterCheck = document.createElement('input');
let elName;//used as reference to identify an edited item when updating local storage

filterLabel.textContent = "Hide who hasn't responded";
filterCheck.type = 'checkbox';
div.appendChild(filterLabel).appendChild(filterCheck);
main.insertBefore(div, ul);


//checks to see it response filter is activated
filterCheck.addEventListener('change', (e)=>{
  const isChecked = e.target.checked;
  const lis = ul.children;
  const display = {
    hide: (i)=>{
      let li = lis[i];
      let label = li.childNodes[1];
      label.style.display = 'none';
      if(li.className !== 'responded'){
        li.style.display = 'none';
        label.style.display = 'none';
      }
     },
    show: (i)=>{
      let li = lis[i];
      let label = li.childNodes[1];
      li.style.display = '';
      label.style.display = '';
    }
  }
  
  if(isChecked){
    for(let i=0; i<lis.length; i++){
      display.hide(i);
    }
  }else{
    for(let i=0; i<lis.length; i++){
      display.show(i);
    }                           
  }
});



//builds <li> and populates with input value
function buildLi(text){
  
  function createElement(elementName, prop, value){
    const element = document.createElement(elementName)
    element[prop] = value;
    return element;
  }
  
  function appendToLi(elementName, prop, value){
    const element = createElement(elementName, prop, value);
    li.appendChild(element);
    return element;
  }
  
  const li = document.createElement('li');
  appendToLi('span', 'textContent', text);
  appendToLi('label', 'textContent', 'Confirm')
    .appendChild(appendToLi('input', 'type', 'checkbox'));
  appendToLi('button', 'textContent', 'edit');
  appendToLi('button', 'textContent', 'remove');

  return li;
}

//listens for sumbit and builds <li>
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  if (inviteInput.value == ''){
    alert("please enter a name");
  }else{
    const text = inviteInput.value;
    inviteInput.value = '';
    const li = buildLi(text);
    ul.appendChild(li);
    const obj = {'name': text, 'chk': false}
    storageAction.set(obj);
  }
})
  
const storageAction = {
  set: (str)=>{
    //asigns list to parsed local storage string
    var list = storageAction.get();
    //checks if string is not true or already exists
    if(!str || list.indexOf(str) > -1){
      //exit if true
      return false;
    }
    //else, push the new str to list array
    list.push(str);
    localStorage.setItem('inviteList', JSON.stringify(list));
    return true;
  },
    
  //retrieves an object array from localStorage
  get: ()=>{
    //creates and variable to hold localStorage string
    var inviteList = localStorage.getItem('inviteList');
    if (inviteList){
      //if the string exists then it is parsed and returned as an array
      return JSON.parse(inviteList);
    }else{
      return [];
    }
  },
    
  //removes object from localStorage
  remove: (str)=>{
    const list = storageAction.get();
    //locates object in localStorage array and removes it
    list.forEach(function(name, i){
      if(name.name === str){
        //splice method used to remove object from array based on index number
        list.splice(i, 1);
        localStorage.setItem('inviteList', JSON.stringify(list));
      }
    });  
  },
  
    
  //updates the 'name' property in the array object
  update: (str, ns)=>{
    const list = storageAction.get();
    list.forEach(function(obj,i){
      if(obj.name === str){
        list[i].name = ns; 
        localStorage.setItem('inviteList', JSON.stringify(list));
      }
    });
  },
    
  //retrieves and updates the 'chk' variable of and array object
  checked: (str)=>{
    const list = storageAction.get();
    list.forEach(function(obj, i){
      //if object name matches
      if(obj.name === str){
        //if chk is true
        if(obj.chk){
          //change to false
          obj.chk = false;
          localStorage.setItem('inviteList', JSON.stringify(list));
        }else{
          //else change to true
          obj.chk = true;
          localStorage.setItem('inviteList', JSON.stringify(list));
        }
      }
    });
  }
}

//executes on load: finds local storage and build the LI for each string in the array
var recentInvites = storageAction.get();

//each array element is examined and built with the buildLI function
recentInvites.forEach(function(obj){
  const li = buildLi(obj.name);
  const checkbox = li.childNodes[1].firstElementChild;
  //cheick if object has a true chk state
  if(obj.chk){
    //checks elements checkbox, changes label, sets class
    checkbox.checked = true;
    checkbox.previousSibling.nodeValue = "Confirmed";
    li.className = 'responded';
  }
  //then appended to the UL
  ul.appendChild(li);
});


  
//listens for checkbox state
ul.addEventListener('change', (e)=>{
  const checkbox = e.target;
  const checked = checkbox.checked;
  const listItem = checkbox.parentNode.parentNode;
  const label = checkbox.previousSibling;
  const name = listItem.firstElementChild.textContent;
  
  //if the checkbox is now checked
  if(checked){
    //update label node
    label.nodeValue = "Confirmed";
    //update the 'chk' property in the localStorage object array
    storageAction.checked(name);
    //add class for styling
    listItem.className = 'responded';
  }else{
    //else do the opposite
    label.nodeValue = "Confirm";
    storageAction.checked(name);
    listItem.className = '';
  }
})

//operates the buttons on <ul>
ul.addEventListener('click', (e)=>{
  if(e.target.tagName == 'BUTTON'){
    const button = e.target;
    const li = e.target.parentNode;
    const ul = li.parentNode;
    const action = button.textContent;
    const nameActions = {
      //remove button
      remove: ()=>{
        const span = li.firstElementChild.textContent;
        ul.removeChild(li);
        storageAction.remove(span);
      },
                    
      //edit button
      edit: ()=>{
        //sets the elName variable (global) to be used when the save button updates the localStorage object
        elName = li.firstElementChild.textContent; //sets a reference to the element before its edited
        const span = li.firstElementChild;
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = span.textContent;
        li.insertBefore(editInput, span);
        li.removeChild(span);
        e.target.textContent = 'save';
      },
        
      //save button
      save: ()=>{
        //elName = li.firstElementChild.value;
        const newSpan = document.createElement('span');
        const input = li.firstElementChild;
        newSpan.textContent = input.value;
        //update the object in localStorage
        storageAction.update(elName, input.value);
        li.prepend(newSpan);
        li.removeChild(input);
        e.target.textContent = 'edit';
      }
    }
    
    //select and run action based on button name
    nameActions[action]();
  }
})