#! /bin/bash

./test.sh
APPENDIX='tree.py kagura.js'
LOCAL='index.js index.js.map index.html index.css'
LIB='jquery.min.js'
for i in $APPENDIX
do
    cp appendix/$i $i 
done
tar -czvf release.tar.gz $LOCAL $LIB $APPENDIX doc/
rm $APPENDIX