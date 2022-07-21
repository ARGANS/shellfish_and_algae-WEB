echo $DATASETS_LINK
curl -s $DATASETS_LINK | node csv.js | node list.js
