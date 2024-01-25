.PHONY: dist/cardboard-vr-profile-generator.html
dist/cardboard-vr-profile-generator.html: CardboardDevice.d.ts
	npm run build

CardboardDevice.d.ts: CardboardDevice.js
	npx pbts -o $@ $<

CardboardDevice.js: CardboardDevice.proto
	npx pbjs -t static-module -w commonjs -o $@ $^

CardboardDevice.proto:
	curl -o $@ https://raw.githubusercontent.com/google/wwgc/master/www/CardboardDevice.proto
