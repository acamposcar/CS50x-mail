/* --------------------
SINGLE EMAILS VIEW
 -----------------------*/

function readEmail(email) {
  /*----------------
  Mark email as read when it is opened
  ----------------*/

  // Change class to show as read without reloading page
  document.querySelector(`#id-${email.id}`).classList.add('read');
  document.querySelector(`#id-${email.id}`).classList.remove('no-read');

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    }),
  });
}

function getEmail(email) {
  /*----------------
  Gets email information from database
  ----------------*/
  fetch(`/emails/${email.id}`)
    .then((response) => response.json())
    .then((emailData) => {
      if (emailData.error) {
        document.querySelector('#alert-email').style.display = 'block';
        document.querySelector('#alert-email').textContent = emailData.error;
      } else {
        openEmail(emailData);
      }
    });
}

function openEmail(email) {
  /*----------------
  Creates single email view
  ----------------*/

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'block';
  document.querySelector('#alert-email').style.display = 'none';
  document.querySelector('.card').style.display = 'block';
  document.querySelector('#empty-email').style.display = 'none';

  // Fill email information
  document.querySelector('#open-email-subject').textContent = email.subject;
  document.querySelector('#open-email-sender').textContent = `From: ${email.sender}`;
  document.querySelector('#open-email-recipients').textContent = `To: ${email.recipients.toString().replace(',', ', ')}`;
  document.querySelector('#open-email-time').textContent = `On: ${email.timestamp}`;
  document.querySelector('#open-email-reply').addEventListener('click', () => { replyEmail(email); });
  document.querySelector('#open-email-body').innerHTML = email.body;

  // Mark email as read when user opens the email
  readEmail(email);
}

/* --------------------
INBOX VIEW
 -----------------------*/

function archiveEmail(email) {
  /*----------------
  Archives or unarchives email when button is pressed
  ----------------*/
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !email.archived,
    }),
  }).then(() => {
    document.querySelector(`#id-${email.id}`).classList.add('hide');
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
  emailContainer.setAttribute('id', `id-${email.id}`);

  // Container to define a clickable zone (All except Archive button)
  const clickableContainer = document.createElement('div');
  clickableContainer.classList.add('email-clickable-container');
  clickableContainer.addEventListener('click', () => getEmail(email));

  // Container to define a flex zone (sender, timestamp, archive button)
  const flexClickableContainer = document.createElement('div');
  flexClickableContainer.classList.add('email-flex-clickable-container');

  // Creates recipient/sender div
  // If selected mailbox is inbox or archive, first field will be the sender
  // If selected mailbox is sent, first field will be the recipient
  if (mailbox === 'inbox' || mailbox === 'archive') {
    const sender = document.createElement('div');
    sender.classList.add('email-from');
    sender.textContent = email.sender;
    flexClickableContainer.appendChild(sender);
  } else {
    const recipient = document.createElement('div');
    recipient.classList.add('email-from');
    recipient.textContent = `${email.recipients.toString().replace(',', ', ').slice(0, 30)}`; // TODO: Show all recipients or more
    flexClickableContainer.appendChild(recipient);
  }

  // Creates timestamp div
  const time = document.createElement('div');
  time.classList.add('email-time');
  time.textContent = email.timestamp;
  flexClickableContainer.appendChild(time);

  // Appends containers
  clickableContainer.appendChild(flexClickableContainer);

  // Creates subject div
  const subject = document.createElement('div');
  subject.classList.add('email-subject');
  subject.textContent = email.subject.slice(0, 50);
  clickableContainer.appendChild(subject);

  // Appends containers
  emailContainer.appendChild(clickableContainer);

  // Add archive/unarchive button to inbox and archive mailboxes
  if (mailbox !== 'sent') {
    const archiveButton = document.createElement('button');
    archiveButton.classList.add('email-archive', 'btn', 'btn-light');
    archiveButton.innerHTML = email.archived
      ? '<img src="/static/mail/archive_black.svg" width="20" height="20" class="d-inline-block align-top" alt="Unarchive"> Unarchive'
      : '<img src="/static/mail/archive_black.svg" width="20" height="20" class="d-inline-block align-top" alt="Archive"> Archive';
    archiveButton.addEventListener('click', () => { archiveEmail(email); });
    emailContainer.appendChild(archiveButton);
  }

  document.querySelector('#emails-view-container').appendChild(emailContainer);
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
        document.querySelector('#alert-compose').style.display = 'block';
        document.querySelector('#alert-compose').textContent = result.error;
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
  document.querySelector('#alert-compose').style.display = 'none';
  document.querySelector('#alert-email').style.display = 'none';

  document.querySelector('#inbox').classList.remove('nav-active');
  document.querySelector('#archived').classList.remove('nav-active');
  document.querySelector('#sent').classList.remove('nav-active');

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
  document.querySelector('#open-email-view').style.display = 'block';
  document.querySelector('#alert-compose').style.display = 'none';
  document.querySelector('#alert-email').style.display = 'none';
  document.querySelector('.card').style.display = 'none';
  document.querySelector('#empty-email').style.display = 'flex';

  if (mailbox === 'inbox') {
    document.querySelector('#inbox').classList.add('nav-active');
    document.querySelector('#archived').classList.remove('nav-active');
    document.querySelector('#sent').classList.remove('nav-active');
  } else if (mailbox === 'archive') {
    document.querySelector('#inbox').classList.remove('nav-active');
    document.querySelector('#archived').classList.add('nav-active');
    document.querySelector('#sent').classList.remove('nav-active');
  } else {
    document.querySelector('#inbox').classList.remove('nav-active');
    document.querySelector('#archived').classList.remove('nav-active');
    document.querySelector('#sent').classList.add('nav-active');
  }

  // Show the mailbox name
  document.querySelector('#empty-email-mailbox').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Clear emails
  document.querySelector('#emails-view-container').innerHTML = '';
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      if (emails.error) {
        document.querySelector('#alert-email').style.display = 'block';
        document.querySelector('#alert-email').textContent = emails.error;
      } else if (emails.length !== 0) {
        document.querySelector('#no-emails').style.display = 'none';
        emails.forEach((email) => createEmailContainer(email, mailbox));
      } else {
        document.querySelector('#no-emails').style.display = 'flex';
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
