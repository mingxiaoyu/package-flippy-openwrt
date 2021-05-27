#!/usr/bin/env bash
#=====================================================================================
# The package file from https://github.com/unifreq/openwrt_packit
# Description: package openwrt
# Lisence: Apache License V2
# Author: mingxiaoyu
#=====================================================================================

# from https://blog.csdn.net/czyt1988/article/details/79110450
ARGS=`getopt -o t:k:v:w:p:o:l:s: --long types:,kernel:,openwrt:,whoami:,path:,out:,url:sub -- "$@"`

if [ $? != 0 ] ; then echo "Terminating..." >&2 ; exit 1 ; fi
eval set -- "${ARGS}" 

while true;do
    case "$1" in
        -t|--types)
            TYPES="$2" 
            shift 2
            ;;
        -k|--kernel)
            KERNEL_VERSION="$2" 
            shift 2
            ;;
        -v|--openwrt)
            OPENWRT_VERSION="$2"
            shift 2
            ;;
        -w|--whoami)
            WHOAMI="$2" 
            shift 2
            ;;
        -p|--path)  
            OPENWRT_PATH="$2" 
            shift 2
            ;;
        -l|--url)  
            OPENWRT_URL="$2" 
            shift 2
            ;;
        -o|--out)  
            OUT="$2" 
            shift 2
            ;;
        -s|--sub)  
            SUB_NAME="$2" 
            shift 2
            ;;
        --)
            shift
            break
            ;;
        *) 
            echo "Unknown property:{$1}"
            exit 1
            ;;
    esac
done


if [ -z $TYPES ];then
    TYPES="n1"
fi
if [ -z $OPENWRT_VERSION ];then
	OPENWRT_VERSION="R21.4.18"
fi
if [ -z $KERNEL_VERSION ];then
    KERNEL_VERSION="Latest"
fi

if [ $KERNEL_VERSION == "Latest" ];then
	rm -rf Latest
	wget https://raw.githubusercontent.com/mingxiaoyu/flippy-packages/main/Latest
	KERNEL_VERSION=$(cat Latest)	
fi

if [ -z $WHOAMI ];then
    WHOAMI="mingxiaoyu"
fi

if [ -z $OUT ];then
    OUT="/out"
fi

echo "TYPES:${TYPES}"
echo "OPENWRT_VERSION:${OPENWRT_VERSION}"
echo "KERNEL_VERSION:${KERNEL_VERSION}"
echo "WHOAMI:${WHOAMI}"
echo "OUT:${OUT}"
echo "OPENWRT_PATH:${OPENWRT_PATH}"
echo "OPENWRT_URL:${OPENWRT_URL}"
echo "SUB_NAME:${SUB_NAME}"

KERNEL_URL="https://github.com/mingxiaoyu/flippy-packages/trunk"

SCRIPT_VPLUS_FILE="mk_h6_vplus.sh"
SCRIPT_BEIKEYUN_FILE="mk_rk3328_beikeyun.sh"
SCRIPT_L1PRO_FILE="mk_rk3328_l1pro.sh"
SCRIPT_S905_FILE="mk_s905_mxqpro+.sh"
SCRIPT_S905D_FILE="mk_s905d_n1.sh"
SCRIPT_S905X2_FILE="mk_s905x2_x96max.sh"
SCRIPT_S905X3_FILE="mk_s905x3_multi.sh"
SCRIPT_S912_FILE="mk_s912_zyxq.sh"
SCRIPT_S022X_FILE="mk_s922x_gtking.sh"

create_makeenv(){
	cd /opt/openwrt
	rm -f make.env 2>/dev/null
cat > make.env <<EOF
WHOAMI="${WHOAMI}"
OPENWRT_VER="${OPENWRT_VERSION}"
KERNEL_VERSION="${KERNEL_VERSION}+o"
KERNEL_PKG_HOME="/opt/kernel"
SFE_FLAG=0
FLOWOFFLOAD_FLAG=1
EOF
}

get_kernel(){
	svn co ${KERNEL_URL}/${KERNEL_VERSION}/kernel
	cp -r kernel/* /opt/kernel
}

get_packefile(){
	svn co ${KERNEL_URL}/opt
	cp -r opt/* /opt
}

get_openwrt_from_url(){
	wget ${OPENWRT_URL} -O /opt/openwrt/openwrt-armvirt-64-default-rootfs.tar.gz
}

get_openwrt(){
	cp -r  ${OPENWRT_PATH} /opt/openwrt/
	
	cd /opt/openwrt/
	filename=$(ls | awk -F '.tar.gz' '{print $1}')	
	sudo mv ${filename}.tar.gz openwrt-armvirt-64-default-rootfs.tar.gz
}

package_openwrt(){
	sudo chmod  -R 777 /opt
	
	cd /opt/openwrt
	
	typearr=(${TYPES//,/ })  

	for type in ${typearr[@]}
	do
	   {
			case "${type}" in
				vplus) sudo ./${SCRIPT_VPLUS_FILE} ;;
				beikeyun) sudo ./${SCRIPT_BEIKEYUN_FILE} ;;
				l1pro) sudo ./${SCRIPT_L1PRO_FILE} ;;
				s905) sudo ./${SCRIPT_S905_FILE} ;;
				s905d | n1) sudo ./${SCRIPT_S905D_FILE} ;;
				s905x2) sudo ./${SCRIPT_S905X2_FILE} ;;
				s905x3) sudo ./${SCRIPT_S905X3_FILE} ;;
				s912) sudo ./${SCRIPT_S912_FILE} ;;
				s922x) sudo ./${SCRIPT_S022X_FILE} ;;
				*) ${WARNING} "Have no this SoC. Skipped."
				 continue ;;
			esac
			echo "The openwrt packaging of ${type} has been completed."
	   }
	done 
	
}

zip_opwnwrt(){
	cd  /opt/openwrt/tmp && sudo gzip *.img
}

move_to_out(){
	test -d ${OUT} || sudo mkdir -p ${OUT}
	
	cd  /opt/openwrt/tmp
	if [ -n "$SUB_NAME" ]; then
		for name in `ls *.img.gz`;do sudo mv $name ${name%.img.gz}-${SUB_NAME}.img.gz;done
	fi
	sudo mv -f  /opt/openwrt/tmp/*.img.gz ${OUT}/
	sudo cp /opt/openwrt/files/update-amlogic-openwrt.sh ${OUT}/update-amlogic-openwrt.sh
	
	cd ${OUT}
	ls
}

get_kernel
get_packefile
create_makeenv

if [ -n "$OPENWRT_PATH" ];then
	echo "start to get openwrt from path"
	get_openwrt
elif  [ -n "$OPENWRT_URL" ];then 
	echo "start to get openwrt from url"
	get_openwrt_from_url
fi

package_openwrt
zip_opwnwrt
move_to_out
echo "done"