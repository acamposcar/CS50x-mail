function composeEmail() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function archiveEmail(emailID, archived) {
  fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !archived,
    }),
  }).then(() => {
    if (archived) {
      loadMailbox('archive');
    } else {
      loadMailbox('inbox');
    }
  });
}

function createEmailContainer(email, mailbox) {
  const emailContainer = document.createElement('div');
  if (email.read === true) {
    emailContainer.classList.add('email', 'read');
  } else {
    emailContainer.classList.add('email');
  }

  if (mailbox === 'inbox' || mailbox === 'archive') {
    const sender = document.createElement('div');
    sender.classList.add('email-from');
    sender.textContent = email.sender;
    emailContainer.appendChild(sender);
  } else {
    const receiver = document.createElement('div');
    receiver.classList.add('email-from');
    receiver.textContent = email.recipients;
    emailContainer.appendChild(receiver);
  }

  const subject = document.createElement('div');
  subject.classList.add('email-subject');
  subject.textContent = email.body;
  emailContainer.appendChild(subject);

  const time = document.createElement('div');
  time.classList.add('email-time');
  time.textContent = email.timestamp;
  emailContainer.appendChild(time);

  if (mailbox !== 'sent') {
    const archiveButton = document.createElement('button');
    archiveButton.classList.add('email-archive', 'btn', 'btn-primary');
    if (email.archived) {
      archiveButton.textContent = 'Unarchive';
    } else {
      archiveButton.textContent = 'Archive';
    }
    archiveButton.addEventListener('click', () => {
      archiveEmail(email.id, email.archived);
    });
    emailContainer.appendChild(archiveButton);
  }

  document.querySelector('#emails-view').appendChild(emailContainer);
}

/* --------------------
SEND EMAILS
 -----------------------*/

function sendEmail() {
  const recipients1 = document.querySelector('#compose-recipients').textContent;
  const subject1 = document.querySelector('#compose-subject').textContent;
  const body1 = document.querySelector('#compose-body').textContent;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients1,
      subject: subject1,
      body: body1,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);
    });
}

/* document
  .querySelector('input[type:"submit"]')
  .addEventListener('click', () => sendEmail());
 */
/* --------------------
GET EMAILS
 -----------------------*/

function loadMailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => createEmailContainer(email, mailbox));
    });
}

document.addEventListener('DOMContentLoaded', () => {
  // Use buttons to toggle between views
  document
    .querySelector('#inbox')
    .addEventListener('click', () => loadMailbox('inbox'));
  document
    .querySelector('#sent')
    .addEventListener('click', () => loadMailbox('sent'));
  document
    .querySelector('#archived')
    .addEventListener('click', () => loadMailbox('archive'));
  document.querySelector('#compose').addEventListener('click', composeEmail);

  // By default, load the inbox
  loadMailbox('inbox');
});
