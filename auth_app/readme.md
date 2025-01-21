Создать Джанго приложение.
1. Приложение должно содержать как минимум следующие модели: Users,
UserProfile, UserFriends.

All code related to task 2 placed in django app folder users.
```bash
users/models.py
```
1. Проявите воображение во время создания модели пользователей,
например используйте такие поля: возраст, интересы, локация...
2. Все модели должны должны быть зарегистрированы в админ зоне.
```bash
users/admin.py
```
![adminzone](readme_images/u1_models_admin_panel.png)
3. Миграции сделаны.
2. Сделать signin/singup пользователей.
1. Через basic auth. C именем пользователя, паролем и почтой, с последующим
заполнение формы для UserProfile. После успешной регистрации пользователь
должен получить имейл и информацией об успешной регистрации. Для
почтового функционала использовать Celery + redis as the broker2. Регистрация через GitHub https://docs.github.com/en/apps/oauth-apps/building-
oauth-apps/differences-between-github-apps-and-oauth-apps

**Signup**:

![signup](readme_images/u2_signup.gif)
**Email**:

![email](readme_images/u3_email_registration_1.png)

![email](readme_images/u4_email_registration_2.png)
<br>
<br>
**Login**:

![login](readme_images/u5_login.gif)
**Github Registration**:

![github](readme_images/u6_login_github.gif)
3. Сброс пароля через почту.

**Password reset**:
![passreset](readme_images/u7_password_reset.gif)
3. Докерезировать приложение с помощью docker-compose.

Start the containers:
```bash
docker-compose up -d
```
Migrations:
```bash
docker-compose exec web python manage.py migrate
```
Create django admin user:
```bash
docker-compose exec web python manage.py createsuperuser
```
![docker](readme_images/docker.png)
Start working with matrix local server (Not related to task 2):
![element](readme_images/u8_local_server_element.png)
![matrixapi](readme_images/u9_local_matrix_rooms.png)
