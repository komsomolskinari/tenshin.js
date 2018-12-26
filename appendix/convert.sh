#! /bin/bash

TEXT="txt ks tjs csv asd func"
IMAGE="png bmp jpg"
VIDEO="wmv"
AUDIO="ogg"

FFMPEG="ffmpeg -hide_banner -loglevel error -y"
CWEBP="cwebp -quiet"
ICONV="iconv -f sjis -t utf8"

function list()
{
	for i in "$@"
	do
		find -type f -name *.$i
	done
}

function name()
{
	echo ${1%.*}
}

function ext()
{
	echo ${1##*.}
}

function convert_image()
{
	for i in "$@"
	do
		echo Convert image $i
		$CWEBP $i -o `name $i`.webp
		rm $i
	done
}

function convert_audio()
{
	for i in "$@"
	do
		echo Convert audio $i
		$FFMPEG -i $i -c:a libopus -b:a 64k `name $i`.ogg
		rm $i
	done
}

function convert_video()
{
	for i in "$@"
	do
		echo Convert video $i
		$FFMPEG -i $i `name $i`.mp4
		rm $i
	done
}

function convert_text()
{
	for i in "$@"
	do
		echo Convert text $i
		mv $i $i.bak
		$ICONV -f sjis -t utf8 $i.bak -o $i
		rm $i.bak
	done
}

function convert_all()
{
	convert_text `list $TEXT`
	convert_image `list $IMAGE`
	convert_audio `list $AUDIO`
	convert_video `list $VIDEO`
}
cp -r game/ game_bak/
echo Now backup...
cd game/
convert_all
cd ..