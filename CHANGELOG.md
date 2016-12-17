# Changelog

## 0.11.3

* Fix changelog

*guedjm, Sat Dec 17 2016 14:07:04 GMT+0100 (CET)*

---
## 0.11.2

* Add state and tag filter on GET /v1/spredcast

*guedjm, Sat Dec 17 2016 14:05:59 GMT+0100 (CET)*

---
## 0.11.1

* Update route GET /v1/users/{id}/following -> /follow

*guedjm, Fri Dec 16 2016 18:18:35 GMT+0100 (CET)*

---
## 0.11.0

* Add /v1/users/{id/pseudo} to get user information
* Add /v1/users/{id}/following to get user follow
* Add /v1/users/{id}/follower to get user follower

*guedjm, Fri Dec 16 2016 18:05:23 GMT+0100 (CET)*

---
## 0.10.2

* Remove following proprety from user object

*guedjm, Fri Dec 16 2016 13:43:36 GMT+0100 (CET)*

---
## 0.10.1

* Fix cast get by tag

*guedjm, Thu Dec 15 2016 18:27:00 GMT+0100 (CET)*

---
## 0.10.0

* Change url to get cast token from /v1/spredcast/{id}/token to /v1/spredcastS/...
* Change url to get cast list from /v1/spredcast to /v1/spredcastS
* Change url to get cast by url from /v1/spredcast/{url} tp /v1/spredcastS/url
* Add route to get cast by tags (/v1/spredcasts/tag{tag})

*guedjm, Sun Dec 11 2016 22:53:26 GMT+0100 (CET)*

---
## 0.9.0

* Integratye tag managment

*guedjm, Sun Dec 11 2016 15:09:26 GMT+0100 (CET)*

---
## 0.8.5

* presenter parameter is not longer required to get a cast token

*guedjm, Sun Nov 20 2016 14:03:13 GMT+0100 (CET)*

---
## 0.8.4

* Update documentation
* Fix tests

*guedj_m, Fri Nov 18 2016 12:06:01 GMT+0100 (CET)*

---
## 0.8.3

* Fix get cast

*guedjm, Fri Nov 11 2016 18:42:49 GMT+0100 (CET)*

---
## 0.8.2

* Minor bug fix

*guedjm, Fri Nov 11 2016 17:56:43 GMT+0100 (CET)*

---
## 0.8.1

* Update doc

*guedjm, Thu Nov 10 2016 20:13:55 GMT+0100 (CET)*

---
## 0.8.0

* Integrate GET /v1/spredcasts to get available spredcast
* Integrate GET /v1/spredcast/url to get a spredcast

*guedjm, Thu Nov 10 2016 20:05:26 GMT+0100 (CET)*

---
## 0.7.1

* Update documentation

*guedj_m, Fri Nov 04 2016 18:49:33 GMT+0100 (CET)*

---
## 0.7.0

* Integrate spredcast token creation
* Fix issue with user creation fb and google

*guedj_m, Fri Nov 04 2016 18:38:52 GMT+0100 (CET)*

---
## 0.6.0

* Update check route to /v1/users/check/...
* Add check google token route (/v1/users/check/google-token/)
* Add check facebook token route (/v1/users/check/facebook-token/)
* Fix documentation

*guedj_m, Thu Sep 22 2016 11:45:43 GMT+0200 (CEST)*

---
## 0.5.2

* Fix little issue on google connect

*guedj_m, Wed Sep 14 2016 13:58:23 GMT-0700 (PDT)*

---
## 0.5.1

* Check are now in GET methods

*guedj_m, Wed Sep 14 2016 11:14:45 GMT-0700 (PDT)*

---
## 0.5.0

* Add route to check if an email is already used by an user
* Fix issue with google login

*guedj_m, Wed Sep 14 2016 15:18:48 GMT+0200 (CEST)*

---
## 0.4.0

* Add pseudo to user
* Add route /v1/users/pseudo/check to check if a pseudo is used
* Add route /v1/users/facebook for user registration with facebook
* Add route /v1/users/google for user registration with google
* Route /v1/oauth2/facebook-connect no longer create user if it doesn't exist
* Route /v1/oauth2/google-connect no longer create user if it doesn't exist

*guedj_m, Mon Sep 05 2016 17:35:38 GMT+0200 (CEST)*

---
## 0.3.0

* Add oauth2 authentication

*guedj_m, Tue Aug 23 2016 13:18:35 GMT+0200 (CEST)*

---
## 0.2.1

* Minor bug fix

*guedj_m, Thu Aug 18 2016 14:50:05 GMT+0200 (CEST)*

---
## 0.2.0

* Add google connect route
* Add Facebook connect route

*guedj_m, Thu Aug 18 2016 14:39:48 GMT+0200 (CEST)*

---
## 0.1.0

* Version ready for spred use

*guedj_m, Thu Aug 11 2016 16:13:09 GMT+0200 (CEST)*

---
## 0.0.0

* Initial version

*guedj_m, Thu Aug 11 2016 16:08:51 GMT+0200 (CEST)*

---