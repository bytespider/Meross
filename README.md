# Meross
Investigating the Meross MSS310 Smart Plug

## Teardown
![alt text](https://raw.githubusercontent.com/bytespider/Meross/master/IMG_6869.JPG)
![alt text](https://raw.githubusercontent.com/bytespider/Meross/master/IMG_6870.JPG)
![alt text](https://raw.githubusercontent.com/bytespider/Meross/master/IMG_6871.JPG)
![alt text](https://raw.githubusercontent.com/bytespider/Meross/master/IMG_6872.JPG)
![alt text](https://raw.githubusercontent.com/bytespider/Meross/master/IMG_6873.JPG)

## UART / Serial interface
The board has a serial connection @ baud 115200.
It appears to be running a custom shell on top of a unix like OS. Other than the provided commands, there looks to be no way to get further info about the OS.

```
R⸮
F1: 0000 0000
V0: 0000 0000 [0001]
00: 0006 000C
01: 0000 0000
U0: 0000 0001 [0000]
T0: 0000 001B
Leaving the BROM

set CP10 an CP11 Full Access
bl_uart_init
hal_emi_configure 
hal_clock_set_pll_dcm_init 
hf_fsys_ck freq=191997
hal_emi_configure_advanced 
custom_setSFIExt 
NOR_init 
hal_flash_init 
read update info from 0xeee00 
read update info from 0xeee00
exit: bl_fota_is_triggered 627
Jump to addr 0x8012000
sleep locked.

normal bootup

No 32k crystal

[T: 128 M: common C: info F: system_init L: 353]: platform:MT7682-E3.
[T: 128 M: common C: info F: system_init L: 354]: system initialize done.

system up:0
[T: 128 M: mrs_main C: info F: mrs_main_task_init L: 224]: main task init ok
Last reset reason:HAL_WDT_SOFTWARE_RESET
meross watch dog start
cmd id 0xdd -- 0x0 seq 0x0
pAd2
===> rt2860_close
###############################
#### Meross IOT running... ####
###############################

cmd id 0xdf -- 0x12 seq 0x1
__original_rt2860_init
EntryLifeCheck=1024
PhyMode=14, BW=0, BssCoex=0, 40MHzIntolerant=0, CH adjustment NOT required!
ap upxx:xx:xx:xx:xx:xx
[T: 140 M: mrs_main C: info F: mrs_main_proc L: 89]: event system up
[T: 141 M: mrs_reset C: info F: mrs_reset_start L: 83]: button reset enable,max count[60]
[T: 141 M: mrs_timer C: info F: mrs_timer_task_WTBL1 for cli[255] fail
	NORMAL MODE
	RMAC_RFCR = 0x1DE70A
	NORMAL MODE
	RMAC_RFCR = 0x1DE70A
Response MAC=xx:xx:xx:xx:xx:xx
Event 0x30 not handled
TxPower = 160
auth:0, encrypt:1

[T: 144 M: mrs_atf C: info F: mrs_autooff_task_init L: 820]: autooff task init ok
[T: 144 M: mrs_http C: info F: mrs_http_handle_event L: 29]: meross httpd handle start
[T: 152 M: mrs_timer C: info F: mrs_timer_nvdm_load_rules L: 556]: load 0 rules
[T: 153 M: mrs_http C: info F: mrs_http_handle_event L: 33]: httpd status = 1
[T: 153 M: mrs_http C: info F: mrs_http_server_start L: 159]: meross http server init success.
[T: 156 M: mrs_atf C: info F: mrs_autooff_nvdm_load_rules L: 712]: load 0 rules
[T: 198 M: mrs_main C: info F: mrs_main_wifi_init_done_handler L: 34]: WiFi Init Done: port = 1
```

### Commands
```
?      - show the comands available
ip     - show current IP config
stat   - show statistics
meross - meross module tools
config - user config read/write/reset/show
reboot - reboot
ver    - f/w ver
```

```
$ ip

interface: lo0
mode:      static
static:
  ip      127.0.0.1
  netmask 255.0.0.0
  gateway 127.0.0.1

interface: ap1
mode:      static
static:
  ip      10.10.10.1
  netmask 255.255.255.0
  gateway 10.10.10.1

interface: st2
mode:      static
static:
  ip      10.10.10.1
  netmask 255.255.255.0
  gateway 10.10.10.1
```

```
$ meross
incomplete command, more options:

hw     - hardware info
fw     - firmware info
net    - network info
task   - task info
mem    - heap info
time   - time info
sun    - suncal info
e2p    - e2p info
ping   - ping tool
power  - energy info
scan   - scan wifi
switch - switch
led    - status led
crash  - crash test
fac    - fac info
test   - hw test
iot    - iot command
```

```
$ meross hw 
hardware info
model     :mss310
local     :us
hw version:2.0.0
chipset   :mt7682
uuid      :xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
mac       :xx:xx:xx:xx:xx:xx
```
UUID seems to be the same one used in communications with the Meross Cloud.


```
$ meross fw
firmware info
fw version:2.1.7
buildDate :2018/11/08 09:58:45 GMT +08:00
```


```
$ meross net
network info:
ip:       :
cmd id 0xd5 -- 0x0 seq 0x5
cmd id 0xd2 -- 0x0 seq 0x6
router mac:xx:x:xx:xx:xx:xx
```
In an unpared state, the route mac address is set to the device's mac address.


```
$ meross task
task info:
name       | status | prio | stack | id
cli        	R	7	748	10
IDLE       	R	0	235	11
Tmr Svc    	B	19	468	12
mrs_main   	B	5	848	2
mrs_atf    	B	4	808	14
mrs_timer  	B	4	800	13
httpd_proc 	B	4	931	15
lwIP       	B	6	457	8
inband     	B	6	956	3
fw_agent   	B	6	987	5
SYSLOG     	B	1	89	1
net        	B	6	942	4
wfw        	B	6	238	6
dhcpd      	B	4	147	9
```
Is a list of currently running processes. Not certain if this is useful, perhaps for debugging during firmware testing.


```
$ meross mem
heap info:
total:184320
free: 83536
low:  80496
```
Amount of memory used from the 180K available. Again probably most useful in debugging new firmware.


```
$ meross time
time info:
local time   :Thu Jan  1 00:08:57 1970 ,local offset:0
utc timestamp:537
system uptime:0h8m57s
```
Shows the currently set time information.
I assume this is set during device paring, on on first connection to the MQTT server. I think this information is used for schedules when the device is unable to connect to the cloud.


```
$ meross sun
latitude:0,longitude:0,tz:0/3600.0
sunrise 05:59
sunset  18:07
```
Current location of the device in the world and the sunset/rise times of that location.
I think this information is used for schedules when the device is unable to connect to the cloud.


```
$ meross e2p
meross e2p uuid               - read uuid
meross e2p uuid {uuid}        - write uuid
meross e2p mac                - read mac
meross e2p mac  {mac}         - write mac
```
Get and Set the UUID and MAC of the device. Probably used during manufacture of the device, though I'm usure why the option to write this information is available out side of Factory Mode.


```
$ meross ping 127.0.0.1
$ [T: 1117837 M: ping C: info F: ping_send L: 194]: [ping]: ping: send seq(0x0001) 127.0.0.1
[T: 1117837 M: ping C: info F: ping_recv L: 256]: [ping]: ping: recv seq(0x0001) 127.0.0.1, 1 ms
```
Pings the specified host. Useful for testing connectivity to the outside world.


```
$ meross power
--------------runtime----------------
energy:cur:0,last:0,now:0
p:0
v:0 (ratio:188)
i:0 (ratio:100)
pulse unit:0
max current:0
report status:todo
report time[0] 00:00
report time[1] 00:00
report time[2] 00:00
--------------history data----------------
no data
```
Current energy data from the HLW8032 chip. It seems that some histoy is stored on board.


```
$ meross scan
Ch  SSID                             BSSID               Auth    Cipher  RSSI    WPS_EN  CM      DPID    SR      
6   VM0000000                        xx:xx:xx:xx:xx:xx   9       8       -21     1       0       0       0         
[MRS Scan Event Callback]: Scan Done!
cmd id 0xd8 -- 0x0 seq 0x3b
```
Performs a WIFI scan. Interesting that this can be done from the device. Perhaps it was inteneded that the App wasnt the only way to configure the device, maybe some page on the built in webserver?


```
meross switch <uuid> on/off
```
External power is required to run the relay, which is not recommended while serial is connected.
My assumtion is that it controls the relay, but why is the device UUID needed? Can we control other devices from this one?


```
$ meross led
meross led red/green on/off/quick/slow
```
Change the LED states. However the LED states seem tied to internal conditions as the LED colours as a result of the command do not match.
you can however trigger disco mode with `$ meross led green quick` ;)


```
$ meross crash
system crash test....
```
Runs some form of crash test.


```
$meross fac
In fac mode:NO
```
Get and Set if the device is on factory mode. `meross fac 1` sets factory mode and `meross fac 0` disables it.


```
$ meross test
meross test relay count interval
$ meross test relay 1 1
```
Tests the the relay is activated <count> number of times every <interval>. External power is required to run the relay, which is not recommended while serial is connected.


```
$ meross iot
incomplete command, more options:
status  - show status
unbind  - unbind
upgrade - upgrade
rule    - show rules
log     - log on|off
dbg     - show debug
```

```
$ meross iot status
wifi status:disconnect
iot status:offline
iot info:
primary   host: :0
secondary host: :0
user id       : 
user key      : 
bind id       : 
```
Shows the status of the device and the MQTT details. Will update this section when paired.


```
$ meross iot unbind
device unbind via cli [Offline]
[T: 274103 M: mrs_main C: info F: mrs_main_proc L: 172]: event factory reset
[T: 274103 M: mrs_event C: warning F: mrs_iot_event_send_primary L: 116]: event not init
```
Unpairs the device then reboots.


```
meross iot upgrade <url>
```
Downloads and installs new firmware. Need to find the URL of a new firmware image to test further.


```
$ meross iot rule
timer rules info:
autooff rules info:
```
Displays information about currently set schedules.


```
$ meross iot log on
mrs_protocol_set_log:protocol package dump 0
```
Need to test further.


```
$ meross iot dbg
cmd id 0xd5 -- 0x0 seq 0x5
cmd id 0xd2 -- 0x0 seq 0x6

{
	"system":	{
		"version":	"2.1.7",
		"sysUpTime":	"0h6m59s",
		"localTimeOffset":	0,
		"localTime":	"Thu Jan  1 00:06:59 1970",
		"suncalc":	"5:59;18:7"
	},
	"network":	{
		"linkStatus":	"disconnect",
		"ssid":	"",
		"gatewayMac":	"xx:xx:xx:xx:xx:xx",
		"innerIp":	"",
		"wifiDisconnectCount":	0
	},
	"cloud":	{
		"activeServer":	"",
		"mainServer":	"",
		"mainPort":	0,
		"secondServer":	"",
		"secondPort":	0,
		"userId":	0,
		"sysConnectTime":	"N/A",
		"sysOnlineT[T wifi C: erro
		"sysDisconnectCount":	0,
		"pingTrace":	[]
	}
}
```
Dumps a bunch of debug information about the current state of the device. Will update when device is paired.

```
$ config
incomplete command, more options:
read   - config read <group_name> <data_item_name>
write  - config write <group_name> <data_item_name> <value>
reset  - config reset <group_name>
show   - config show <group_name>
```

```
$ config show
show all group 
[common]OpMode: 1
[common]CountryCode: CN
[common]CountryRegion: 5
[common]CountryRegionABand: 3
[common]RadioOff: 0
[common]DbgLevel: 3
[common]RTSThreshold: 2347
[common]FragThreshold: 2346
[common]BGChannelTable: 1,14,0|
[common]AChannelTable: 36,8,0|100,11,0|149,4,0|
[common]syslog_filters: 
[common]WiFiPrivilegeEnable: 0
[common]StaFastLink: 0
[STA]LocalAdminMAC: 1
[STA]MacAddr: xx:xx:xx:xx:xx:xx
[STA]Ssid: MTK_SOFT_AP
[STA]SsidLen: 11
[STA]BssType: 1
[STA]Channel: 1
[STA]BW: 0
[STA]WirelessMode: 9
[STA]BADecline: 0
[STA]AutoBA: 1
[STA]HT_MCS: 33
[STA]HT_BAWinSize: 4
[STA]HT_GI: 1
[STA]HT_PROTECT: 1
[STA]HT_EXTCHA: 1
[STA]WmmCapable: 1
[STA]ListenInterval: 1
[STA]AuthMode: 0
[STA]EncrypType: 1
[STA]WpaPsk: 12345678
[STA]WpaPskLen: 8
[STA]PMK_INFO: 0
[STA]PairCipher: 0
[STA]GroupCipher: 0
[STA]DefaultKeyId: 0
[STA]SharedKey: 12345,12345,12345,12345
[STA]SharedKeyLen: 5,5,5,5
[STA]PSMode: 0
[STA]KeepAlivePeriod: 55
[STA]BeaconLostTime: 20
[STA]ApcliBWAutoUpBelow: 1
[STA]StaKeepAlivePacket: 1
[AP]LocalAdminMAC: 1
[AP]MacAddr: xx:xx:xx:xx:xx:xx
[AP]Ssid: Meross_SW_XXXX
[AP]SsidLen: 14
[AP]Channel: 1
[AP]BW: 0
[AP]WirelessMode: 9
[AP]AutoBA: 1
[AP]HT_MCS: 33
[AP]HT_BAWinSize: 4
[AP]HT_GI: 1
[AP]HT_PROTECT: 1
[AP]HT_EXTCHA: 1
[AP]WmmCapable: 1
[AP]DtimPeriod: 1
[AP]AuthMode: 0
[AP]EncrypType: 1
[AP]WpaPsk: 12345678
[AP]WpaPskLen: 8
[AP]PairCipher: 0
[AP]GroupCipher: 0
[AP]DefaultKeyId: 0
[AP]SharedKey: 11111,22222,33333,44444
[AP]SharedKeyLen: 5,5,5,5
[AP]HideSSID: 0
[AP]RekeyInterval: 3600
[AP]AutoChannelSelect: 0
[AP]BcnDisEn: 0
[network]IpAddr: 10.10.10.1
[network]IpNetmask: 255.255.255.0
[network]IpGateway: 10.10.10.1
[network]IpMode: dhcp
[meross]dev.cfg.ResetCount: 0
[meross]dev.cfg.State: 0
[meross]dev.cfg.Bind: 0
[meross]dev.cfg.Key: 
[meross]dev.cfg.bindTime: 0
[meross]dev.cfg.bindId: 
[meross]dev.cfg.Server: 
[meross]dev.cfg.Port: 
[meross]dev.cfg.BackServer: 
[meross]dev.cfg.BackPort: 
[meross]dev.cfg.userId: 
[meross]dev.cfg.upgradeFlag: 0
[meross]dev.cfg.DNDMode: 0
[meross]dev.cfg.networkTrace00: 
[meross]dev.cfg.networkTrace01: 
[meross]dev.cfg.networkTrace02: 
[meross]dev.cfg.networkTrace03: 
[meross]dev.cfg.networkTrace04: 
[meross]dev.ctl.timeZone: 
[meross]dev.ctl.timeStamp: 0
[meross]dev.ctl.latitude: 0
[meross]dev.ctl.longitude: 0
[meross]dev.ctl.switchStatus.00: 1
[meross]dev.ctl.SwitchLmTime.00: 0
[meross]dev.ctl.switchStatus.01: 1
[meross]dev.ctl.SwitchLmTime.01: 0
[meross]dev.ctl.switchStatus.02: 1
[meross]dev.ctl.SwitchLmTime.02: 0
[meross]dev.ctl.switchStatus.03: 1
[meross]dev.ctl.SwitchLmTime.03: 0
[meross]dev.ctl.switchStatus.04: 1
[meross]dev.ctl.SwitchLmTime.04: 0
[meross]dev.ctl.switchStatus.05: 1
[meross]dev.ctl.SwitchLmTime.05: 0
[meross]dev.tim.Rule.00: 
[meross]dev.tim.Rule.01: 
[meross]dev.tim.Rule.02: 
[meross]dev.tim.Rule.03: 
[meross]dev.tim.Rule.04: 
[meross]dev.tim.Rule.05: 
[meross]dev.tim.Rule.06: 
[meross]dev.tim.Rule.07: 
[meross]dev.tim.Rule.08: 
[meross]dev.tim.Rule.09: 
[meross]dev.tim.Rule.10: 
[meross]dev.tim.Rule.11: 
[meross]dev.tim.Rule.12: 
[meross]dev.tim.Rule.13: 
[meross]dev.tim.Rule.14: 
[meross]dev.tim.Rule.15: 
[meross]dev.tim.Rule.16: 
[meross]dev.tim.Rule.17: 
[meross]dev.tim.Rule.18: 
[meross]dev.tim.Rule.19: 
[meross]dev.tmr.Rule.00: 
[meross]dev.tmr.Rule.01: 
[meross]dev.tmr.Rule.02: 
[meross]dev.tmr.Rule.03: 
[meross]dev.tmr.Rule.04: 
[meross]dev.tmr.Rule.05: 
[meross]dev.tmr.Rule.06: 
[meross]dev.tmr.Rule.07: 
[meross]dev.tmr.Rule.08: 
[meross]dev.tmr.Rule.09: 
[meross]dev.tmr.Rule.10: 
[meross]dev.tmr.Rule.11: 
[meross]dev.tmr.Rule.12: 
[meross]dev.tmr.Rule.13: 
[meross]dev.tmr.Rule.14: 
[meross]dev.tmr.Rule.15: 
[meross]dev.tmr.Rule.16: 
[meross]dev.tmr.Rule.17: 
[meross]dev.tmr.Rule.18: 
[meross]dev.tmr.Rule.19: 
[meross]dev.tmr.Rule.20: 
[meross]dev.tmr.Rule.21: 
[meross]dev.tmr.Rule.22: 
[meross]dev.tmr.Rule.23: 
[meross]dev.tmr.Rule.24: 
[meross]dev.tmr.Rule.25: 
[meross]dev.tmr.Rule.26: 
[meross]dev.tmr.Rule.27: 
[meross]dev.tmr.Rule.28: 
[meross]dev.tmr.Rule.29: 
[meross]dev.tmr.Rule.30: 
[meross]dev.tmr.Rule.31: 
[meross]dev.atf.Rule.00: 
[meross]dev.atf.Rule.01: 
[meross]dev.atf.Rule.02: 
[meross]dev.atf.Rule.03: 
[meross]dev.atf.Rule.04: 
[meross]dev.atf.Rule.05: 
[meross]dev.atf.Rule.06: 
[meross]dev.atf.Rule.07: 
[meross]dev.atf.Rule.08: 
[meross]dev.atf.Rule.09: 
[meross]dev.atf.Rule.10: 
[meross]dev.atf.Rule.11: 
[meross]dev.atf.Rule.12: 
[meross]dev.atf.Rule.13: 
[meross]dev.atf.Rule.14: 
[meross]dev.atf.Rule.15: 
[meross]dev.atf.Rule.16: 
[meross]dev.atf.Rule.17: 
[meross]dev.atf.Rule.18: 
[meross]dev.atf.Rule.19: 
[meross]dev.atf.Rule.20: 
[meross]dev.atf.Rule.21: 
[meross]dev.atf.Rule.22: 
[meross]dev.atf.Rule.23: 
[meross]dev.atf.Rule.24: 
[meross]dev.atf.Rule.25: 
[meross]dev.atf.Rule.26: 
[meross]dev.atf.Rule.27: 
[meross]dev.atf.Rule.28: 
[meross]dev.atf.Rule.29: 
[meross]dev.atf.Rule.30: 
[meross]dev.atf.Rule.31: 
[meross]dev.enr.data01: 
[meross]dev.enr.data02: 
[meross]dev.enr.data03: 
[meross]dev.enr.data04: 
[meross]dev.enr.data05: 
[meross]dev.enr.data06: 
[meross]dev.enr.data07: 
[meross]dev.enr.data08: 
[meross]dev.enr.data09: 
[meross]dev.enr.data10: 
[meross]dev.enr.data11: 
[meross]dev.enr.data12: 
[meross]dev.enr.data13: 
[meross]dev.enr.data14: 
[meross]dev.enr.data15: 
[meross]dev.enr.data16: 
[meross]dev.enr.data17: 
[meross]dev.enr.data18: 
[meross]dev.enr.data19: 
[meross]dev.enr.data20: 
[meross]dev.enr.data21: 
[meross]dev.enr.data22: 
[meross]dev.enr.data23: 
[meross]dev.enr.data24: 
[meross]dev.enr.data25: 
[meross]dev.enr.data26: 
[meross]dev.enr.data27: 
[meross]dev.enr.data28: 
[meross]dev.enr.data29: 
[meross]dev.enr.data30: 
[meross]dev.enr.VRatio: 188
[meross]dev.enr.IRatio: 100
[meross]dev.enr.ratioFlag: 0
[factory]dev.fac.locale: us
[factory]dev.fac.uuid: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
[factory]dev.fac.mac: xx:xx:xx:xx:xx:xx
[factory]dev.fac.mode: 0
[factory]dev.fac.testStep: 0
[factory]dev.cfg.traceInfo: 
```
Sections in brackets are the group names used for other commands.


```
$ ver
CM4 Image Ver: SDK_V4.6.2
N9 Image  Ver: 20170823172833
```
Not sure what this information relates to. Perhaps the build environment for the MediaTek chip?

### LED status

#### Red flashing
Device is in factory mode. As far as I can tell the only way back is via serial and running the commands
```
$ meross fac 0
$ reboot
```

#### Green Orange Alternating
Device is in pairing mode

#### Green
Device is paired and relay is active



