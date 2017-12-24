#!/bin/sh

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"

git add $COMMENT_DIR
git commit --message "Travis static comment build: $TRAVIS_BUILD_NUMBER"

git remote add origin https://${GH_TOKEN}@github.com/$GH_USERNAME/$GH_REPO.git
git push --set-upstream origin master