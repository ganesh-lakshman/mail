document.addEventListener('DOMContentLoaded', function() {



  // send email

  document.querySelector('#compose-form').onsubmit = send_email;

  // Use buttons to toggle between views

  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // load content of mailbox

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        const element = document.createElement('div');
        element.style.border = "thin solid black";
        if(email.read){
          element.style.backgroundColor = "grey";
        }
        
        element.innerHTML += `${email.sender.bold()}  ${email.subject} `;
        element.innerHTML += `<p style='float: right;'>${email.timestamp}<p>`
        document.querySelector('#emails-view').append(element);

        // when an element is clicked

        element.addEventListener('click', function() {
          if(!email.read){
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
            })
          }
          
          console.log('This email has been clicked!');
          console.log(email);
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#email-view').style.display = 'block';
          document.querySelector('#email-details').innerHTML = `<b>From:</b> ${email.sender} <br> <b>To:</b> ${email.recipients} <br> <b>Subject:</b> ${email.subject} <br> <b>Timestamp:</b> ${email.timestamp}`;
          document.querySelector('#email-body').innerHTML = `${email.body}`;
          if(mailbox === 'inbox'){
            document.querySelector('#arch').style.visibility = 'visible';
            document.querySelector('#arch').innerHTML = 'Archive';
            document.querySelector('#arch').onclick = () => {
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              })
              .then(() => document.querySelector('#inbox').click())
            }
            
          }
          else if(mailbox === 'archive'){
            document.querySelector('#arch').style.visibility = 'visible';
            document.querySelector('#arch').innerHTML = 'Unarchive';
            document.querySelector('#arch').onclick = () => {
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
              })
              .then(() => document.querySelector('#inbox').click())
            }
            
          }
          else{
            document.querySelector('#arch').style.visibility = 'hidden';
          }
          document.querySelector('#reply').onclick = () => {
            compose_email();
            document.querySelector('#compose-recipients').value = email.sender;
            if(email.subject.slice(0, 4) !== 'Re: ')
            {
              document.querySelector('#compose-subject').value = 'Re: ' + email.subject;

            }
            document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:` + email.body;
          
          }

          
          });
      });
  });

}

function send_email() {
  
  recipients = document.querySelector('#compose-recipients').value;
  subject = document.querySelector('#compose-subject').value;
  body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      load_mailbox("sent");
      console.log(result);
  });
  return false;
  
  
}