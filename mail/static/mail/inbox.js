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

function readEmail(emailID) {
  fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    }),
  });
}

/* --------------------
SINGLE EMAILS VIEW
 -----------------------*/

function openEmail(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'block';

  // Clear previous emails
  const emailContainer = document.querySelector('#open-email-view');
  emailContainer.innerHTML = '';

  const recipients = document.createElement('div');
  recipients.classList.add('open-email-recipients');
  recipients.textContent = email.recipients;
  emailContainer.appendChild(recipients);

  const sender = document.createElement('div');
  sender.classList.add('open-email-sender');
  sender.textContent = email.sender;
  emailContainer.appendChild(sender);

  const time = document.createElement('div');
  time.classList.add('open-email-time');
  time.textContent = email.timestamp;
  emailContainer.appendChild(time);

  const subject = document.createElement('div');
  subject.classList.add('open-email-subject');
  subject.textContent = email.subject;
  emailContainer.appendChild(subject);

  const body = document.createElement('div');
  body.classList.add('open-email-body');
  body.textContent = email.body;
  emailContainer.appendChild(body);

  readEmail(email.id);
}

function getEmail(emailID) {
  fetch(`/emails/${emailID}`)
    .then((response) => response.json())
    .then((email) => openEmail(email));
}

/* --------------------
INBOX VIEW
 -----------------------*/

function createEmailContainer(email, mailbox) {
  const emailContainer = document.createElement('div');
  if (email.read === true) {
    emailContainer.classList.add('email-container', 'read');
  } else {
    emailContainer.classList.add('email-container');
  }

  // Container to define a clickable zone (All except Archive button)
  const clickableContainer = document.createElement('div');
  clickableContainer.classList.add('email-clickable-container');

  if (mailbox === 'inbox' || mailbox === 'archive') {
    const sender = document.createElement('div');
    sender.classList.add('email-from');
    sender.textContent = email.sender;
    clickableContainer.appendChild(sender);
  } else {
    const receiver = document.createElement('div');
    receiver.classList.add('email-from');
    receiver.textContent = email.recipients[0]; // TODO: Show all recipients or more
    clickableContainer.appendChild(receiver);
  }

  const subject = document.createElement('div');
  subject.classList.add('email-subject');
  subject.textContent = email.subject.slice(0, 50);
  clickableContainer.appendChild(subject);

  const time = document.createElement('div');
  time.classList.add('email-time');
  time.textContent = email.timestamp;
  clickableContainer.appendChild(time);

  emailContainer.appendChild(clickableContainer);

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

  clickableContainer.addEventListener('click', () => getEmail(email.id));
}

/* --------------------
SEND EMAILS
 -----------------------*/

function sendEmail() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
    }),
  })
    .then((response) => response.json())
    .catch((error) => console.error('Error:', error)) // TODO handle error. Call another function???
    .then((result) => console.log('Success:', result))
    .then(loadMailbox('sent'));
}

function composeEmail() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#open-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document
    .querySelector('input[type="submit"]')
    .addEventListener('click', (event) => {
      event.preventDefault(); // If not Submit button will make GET request
      sendEmail();
    });
}

/* --------------------
GET EMAILS
 -----------------------*/

function loadMailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'none';

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
