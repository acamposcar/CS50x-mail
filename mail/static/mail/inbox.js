/* --------------------
SINGLE EMAILS VIEW
 -----------------------*/

function readEmail(emailID) {
  /*----------------
  Mark email as read when it is opened
  ----------------*/
  fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    }),
  });
}

function getEmail(emailID) {
  /*----------------
  Gets email information from database
  ----------------*/
  fetch(`/emails/${emailID}`)
    .then((response) => response.json())
    .then((email) => {
      if (email.error) {
        document.querySelector('#alert').style.display = 'block';
        document.querySelector('#alert').textContent = email.error;
      } else {
        openEmail(email);
      }
    });
}

function openEmail(email) {
  /*----------------
  Creates single email view
  ----------------*/

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'block';
  document.querySelector('#alert').style.display = 'none';

  // Clear previous emails
  const emailContainer = document.querySelector('#open-email-view');
  emailContainer.innerHTML = '';

  // Create subject div
  const subject = document.createElement('h4');
  subject.classList.add('open-email-subject');
  subject.innerHTML = email.subject;
  emailContainer.appendChild(subject);

  // Create senders div
  const sender = document.createElement('div');
  sender.classList.add('open-email-sender');
  sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
  emailContainer.appendChild(sender);

  // Create recipients div
  const recipients = document.createElement('div');
  recipients.classList.add('open-email-recipients');
  recipients.innerHTML = `<strong>To:</strong> ${email.recipients}`;
  emailContainer.appendChild(recipients);

  // Create timestamp div
  const time = document.createElement('div');
  time.classList.add('open-email-time');
  time.innerHTML = `<strong>Time:</strong>: ${email.timestamp}`;
  emailContainer.appendChild(time);

  // Create reply button
  const reply = document.createElement('button');
  reply.classList.add('open-email-reply', 'btn', 'btn-primary');
  reply.textContent = 'Reply';
  reply.addEventListener('click', () => { replyEmail(email); });
  emailContainer.appendChild(reply);

  // Create body div
  const body = document.createElement('div');
  body.classList.add('open-email-body');
  body.textContent = email.body;
  emailContainer.appendChild(body);

  // Mark email as read when user opens the email
  readEmail(email.id);
}

/* --------------------
INBOX VIEW
 -----------------------*/

function archiveEmail(emailID, archived) {
  /*----------------
  Archives or unarchives email when button is pressed
  ----------------*/
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
  /*----------------
  Creates email container for every email
  ----------------*/

  // If the mail has already been read, add the class 'read'
  const emailContainer = document.createElement('div');
  if (email.read === true) {
    emailContainer.classList.add('email-container', 'read');
  } else {
    emailContainer.classList.add('email-container', 'no-read');
  }

  // Container to define a clickable zone (All except Archive button)
  const clickableContainer = document.createElement('div');
  clickableContainer.classList.add('email-clickable-container');
  clickableContainer.addEventListener('click', () => getEmail(email.id));

  // Creates recipient/sender div
  // If selected mailbox is inbox or archive, first field will be the sender
  // If selected mailbox is sent, first field will be the recipient
  if (mailbox === 'inbox' || mailbox === 'archive') {
    const sender = document.createElement('div');
    sender.classList.add('email-from');
    sender.textContent = email.sender;
    clickableContainer.appendChild(sender);
  } else {
    const recipient = document.createElement('div');
    recipient.classList.add('email-from');
    recipient.textContent = email.recipients[0]; // TODO: Show all recipients or more
    clickableContainer.appendChild(recipient);
  }

  // Creates subject div
  const subject = document.createElement('div');
  subject.classList.add('email-subject');
  subject.textContent = email.subject.slice(0, 50);
  clickableContainer.appendChild(subject);

  // Creates timestamp div
  const time = document.createElement('div');
  time.classList.add('email-time');
  time.textContent = email.timestamp;
  clickableContainer.appendChild(time);

  // Appends Clickable container to email container
  emailContainer.appendChild(clickableContainer);

  // Add archive/unarchive button to inbox and archive mailboxes
  if (mailbox !== 'sent') {
    const archiveButton = document.createElement('button');
    archiveButton.classList.add('email-archive', 'btn', 'btn-primary');
    archiveButton.textContent = email.archived ? 'Unarchive' : 'Archive';
    archiveButton.addEventListener('click', () => { archiveEmail(email.id, email.archived); });
    emailContainer.appendChild(archiveButton);
  }

  document.querySelector('#emails-view').appendChild(emailContainer);
}

/* --------------------
SEND EMAILS
 -----------------------*/

function sendEmail() {
  /*----------------
  Send email (POST)
  ----------------*/
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        document.querySelector('#alert').style.display = 'block';
        document.querySelector('#alert').textContent = result.error;
      } else {
        loadMailbox('sent');
      }
    });
}

function composeEmail() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#open-email-view').style.display = 'none';
  document.querySelector('#alert').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('form').onsubmit = () => {
    sendEmail();
    return false;
  };
}

function replyEmail(email) {
  /*----------------
  Pre-fill form to reply to emails
  ---------------- */

  composeEmail();

  document.querySelector('#compose-recipients').value = email.sender;

  // Add Re: to reply subject if it isn't there already
  if (email.subject.slice(0, 3) !== 'Re:') {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  } else {
    document.querySelector('#compose-subject').value = email.subject;
  }

  document.querySelector('#compose-body').value = `\n---------\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
}

/* --------------------
GET EMAILS
 -----------------------*/

function loadMailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'none';
  document.querySelector('#alert').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      if (emails.error) {
        document.querySelector('#alert').style.display = 'block';
        document.querySelector('#alert').textContent = emails.error;
      } else {
        emails.forEach((email) => createEmailContainer(email, mailbox));
      }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => loadMailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => loadMailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => loadMailbox('archive'));
  document.querySelector('#compose').addEventListener('click', composeEmail);
  // By default, load the inbox
  loadMailbox('inbox');
});
