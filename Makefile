
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test release

install:
	npm install

eslint:
	$(shell npm bin)/eslint src

build:
	$(shell npm bin)/rollup src/render.js --output.format cjs --output.file dist/render.cjs.js
	$(shell npm bin)/rollup src/render.js --output.format umd --output.file dist/render.umd.js -n renderNodes

test: install eslint build
	$(shell npm bin)/karma start karma.conf.js

npm.publish:
	git pull --tags
	npm version patch
	git push origin $(git_branch) && git push --tags
	npm publish --access public

github.release: export REPOSITORY=triskeljs/render
github.release: export PKG_VERSION=$(shell node -e "console.log('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/${REPOSITORY}/releases" )
github.release:
	@echo ${RELEASE_URL}
	@echo "\nhttps://github.com/${REPOSITORY}/releases/tag/${PKG_VERSION}\n"

pre.publish:
	git add dist -f --all
	-git commit -n -m "updating dist" 2> /dev/null; true

post.release:
	git reset --soft HEAD~1
	git reset HEAD
	# git reset --hard origin/$(git_branch)
	# @git checkout $(git_branch)

release: test pre.publish npm.publish github.release
