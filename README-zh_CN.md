通过Flippy脚本对Arm软路由进行OpenWrt进行打包

[English](./README.md) | 简体中文

[![unifreq](https://img.shields.io/badge/kernel-unifreq-blue.svg?style=flat-square&logo=telegram)](https://t.me/openwrt_flippy) 
[![unifreq](https://img.shields.io/badge/scripts-unifreq-blue.svg?style=flat-square&logo=github)](https://github.com/unifreq/openwrt_packit) 

喜欢的可以给个Star. 想自己打包的，也没必要fork。直接食用即可。把whoami的值设置为你的名字。  
我为人人，人人为我，还是希望大家PR内核到这里[flippy-packages](https://github.com/mingxiaoyu/flippy-packages)。  
工作原因，更新最新内核可能晚一天这样。主要是F大每次发新内核时间都是大晚上。第二天要上班。更新只能是第二天晚上。  
PR给我。我还是可以在上班时间去合并的。如果希望协助更新内核。提Issue给我，我给你权限

# 参数

| 输入 | 类型 |描述 | 值 |
| --- | --- | --- |--- |
| types           | String | 需要打包的设备类型 (必填)|   默认值： s905d.  打包多个设备: s905d,s905x2.  分隔符为 ,      |
| openwrt-version | String | OpenWrt版本  |  默认值：null   |
|kernel-version| String | 内核版本 | 默认值： Latest. Latest ： +o的最新版.  latest+ ： +的最新版 |
|whoami|  String | 谁打包 | 默认值： mingxiaoyu|
|out| String | 镜像的输出地址  | 默认值： /out |
|openwrt-path| String | OpenWrt的路径 |   默认值： null. openwrt-path和openwrt-url必须有一个。两个都存在时，优先openwrt-path |
|openwrt-url| String | OpenWrt的Url |  默认值： null. openwrt-path和openwrt-url必须有一个。两个都存在时，优先openwrt-path  |
|sub-name |  String | 镜像的别名: xxxx-xx-{sub-name}.img.gz| 默认值 ： null |
    
 kernel-version 在[flippy-packages](https://github.com/mingxiaoyu/flippy-packages)中找。
 types: 目前支持的打包设备，plus,beikeyun,l1pro,s905,s905d,s905x2,s905x3,s912,s922x.
 
| 输出 | 类型 | 描述 | 值 |
| --- | --- | --- | --- |
| status | boolean | action的状态 | true or false |

# 使用方法

v2.0 和 main 使用TypeScript编译。.
这个版本可以设置内核版本为Laster+ （+版）和Laster(+o版)
```
 name: Package OpenWrt with flippy script
  # You may pin to the exact commit or the version.
  uses: mingxiaoyu/package-flippy-openwrt@main
  with:
    # 备类型,默认值s905d(N1）
    types: # optional, default is s905d
    # OpenWrt版本,可以不设
    openwrt-version: # optional
    # 内核版本。默认为+o
    kernel-version: # optional, Latest
    # 要显示自己打包的，设置这个值 whoami: 我是活雷锋。 不设置，就是我本人：mingxiaoyu
    # openwrt打包成镜像路径
    out: # optional, default is /out
    # openwrt的路径
    openwrt-path: # optional
    # openwrt的url
    openwrt-url: # optional
    # add the sub name in file: xxxx-xx-{sub-name}.img.gz
    sub-name: # optional
 ```
 简单用法
 ```
 name: Package OpenWrt with flippy script
  # You may pin to the exact commit or the version.
  uses: mingxiaoyu/package-flippy-openwrt@main
  with:
    # 设备类型,默认值s905d(N1）
    types: s905d
    # openwrt-path和openwrt-url必须设置一个。 openwrt-path ：xxxx  openwrt-url:https://xxxxx
    openwrt-path/openwrt-url: # optional
 ```
