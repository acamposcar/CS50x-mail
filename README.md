# CS50x-mail
Design a front-end for an email client that makes API calls to send and receive emails.

- [Specifications](https://cs50.harvard.edu/web/2020/projects/3/mail/)
- [Screencast](https://www.youtube.com/watch?v=eEfJGCZ1xf8)

![Demo GIF](https://user-images.githubusercontent.com/9263545/159908669-e55b5cf8-dd4d-4b65-adb1-5a5001946263.gif)

## Live Demo
[Live Demo](https://acampos-cs50x-mail.herokuapp.com/login)

Create a new user or use these credentials to log in:
- User: user@example.com
- Password: password

If you want to test the application, you can send emails to acampos@example.com


## Installation

1. Clone the project

2. Install all necessary dependencies
    ```python
        pip3 install -r requirements.txt
    ```

3. Migrate database
    ```python
        python3 manage.py migrate
    ```

4. Run Django server
    ```python
        python3 manage.py runserver
    ```
