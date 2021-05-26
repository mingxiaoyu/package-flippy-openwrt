# package-flippy-openwrt

# Parameters

| Inputs | Description | Value |
| --- | --- | --- |
| types           | he type of the drive |   plus,beikeyun,l1pro,s905,s905d,s905x2,s905x3,s912,s922x  default is s905d |
| openwrt-version | The openwrt version  |  default is R21.4.18                                                        |
|kernel-version| The kernel version | default is Latest |
|whoami|  The name of build the openwrt | default is mingxiaoyu|
|out| The output path of the openwrt  | default is /out |
|openwrt-path| The input path of the openwrt |   default is null. openwrt-path or openwrt-url should have one.  |
|openwrt-url| The url of the openwrt|  default is null. openwrt-path or openwrt-url should have one.  |
|sub-name |  add the sub name in file: xxxx-xx-{sub-name}.img.gz| default is null |
    
 kernel-version check in [flippy-packages](https://github.com/mingxiaoyu/flippy-packages)


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
