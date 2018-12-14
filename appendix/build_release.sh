#! /bin/bash
TEMP='temp'
RELEASE='release.tar.gz'
APPENDIX='tree.py kagura.js'
MAIN='README.md LICENSE'

case $1 in
    min)
        NOAPPENDIX='true'
        WEBPACK_PARAM='--mode production --devtool none'
        ;;
    *)
        WEBPACK_PARAM=''
        ;;
esac

echo "Compiling"
npx webpack --silent $WEBPACK_PARAM --output-path $TEMP

if [ "$NOAPPENDIX" == "true" ]
then
    echo "No more content"
else
    echo "Coping content"
    # Readme, License
    for i in $MAIN
    do
        cp $i $TEMP/$i
    done
    # Appendix
    for i in $APPENDIX
    do
        cp appendix/$i $TEMP/$i
    done
    # Docs
    cp -r doc/ $TEMP
fi

echo "Packing"
cd $TEMP
tar -czf $RELEASE *
cd ..

echo "Cleaning"
mv $TEMP/$RELEASE dist/
rm $TEMP -r

echo "OK"