#! /bin/bash

./test.sh
APPENDIX='generate_tree_json.py hfs.vfs nginx.conf'
LOCAL='index.js index.js.map index.html index.css'
LIB='jquery.min.js'
for i in $APPENDIX
do
    cp appendix/$i $i 
done
tar -czvf release.tar.gz $LOCAL $LIB $APPENDIX
rm $APPENDIX