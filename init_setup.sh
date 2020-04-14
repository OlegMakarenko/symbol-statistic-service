#!/bin/sh

# install symbol-data-lib
git clone https://github.com/nemfoundation/symbol-data-lib.git
cd symbol-data-lib
npm install
npm run build
cd ..

# install Symbol-statistic-service
npm install
