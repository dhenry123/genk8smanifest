#!/bin/bash
if [ "$1" == "" ];then
    echo "Passer la chaine base64 en paramètre de commande"
    exit 1
fi
echo "decode base64 : $1 to string"
echo "$1"|base64 -d
echo ""
