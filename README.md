# package-flippy-openwrt

# Parameters

 1.types: vplus,beikeyun,l1pro,s905,s905d,s905x2,s905x3,s912,s922x (mutiple) or  s905d (single)

 2.openwrt-path and openwrt-url should have one.
 
 3.kernel-version check in [flippy-packages](https://github.com/mingxiaoyu/flippy-packages)


# Usage the aciton
```
 name: Package OpenWrt with flippy script
  # You may pin to the exact commit or the version.
  uses: mingxiaoyu/package-flippy-openwrt@v1.0
  with:
    # The type of the drive
    types: # optional, default is s905d
    # The openwrt version
    openwrt-version: # optional, default is R21.4.18
    # The kernel version
    kernel-version: # optional, default is 5.4.119-flippy-59
    # The name of build the openwrt
    whoami: # optional, default is mingxiaoyu
    # The output path of the openwrt
    out: # optional, default is /out
    # The input path of the openwrt
    openwrt-path: # optional
    # The url of the openwrt
    openwrt-url: # optional
    # add the sub name in file: xxxx-xx-{sub-name}.img.gz
    sub-name: # optional
 ```
