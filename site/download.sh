if [ "$3" = 'A' ]; then 
    columns='Temperature,eastward_Water_current,northward_Water_current,Nitrate,Ammonium,Phosphate,par'
else
    columns='Temperature,eastward_Water_current,northward_Water_current,Chlorophyll-a,par'
fi

curl -s $1 | node csv.js | node list.js "$columns" > $2
