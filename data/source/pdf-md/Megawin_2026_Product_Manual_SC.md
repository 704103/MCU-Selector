2026H2


8051
MCU
                      Arm® Cortex®-
                        M0+/M0
                                           Arm®
                                         Cortex®-M3
                    BLDC

Power IC

                        Peripheral IC




                                                         MG




           Megawin Technology Co.,Ltd.

                                             2026H2_Megawin_Brochure(SC)_v1.2 (2026/10)
                                1
                                2




 Arm® Cortex®-M3                3
Arm® Cortex®-M0+                5
 Arm® Cortex®-M0                6
      8051 MCU                 10
                 MCU           10
        MG82F6D                10
          IC                   17
    Power IC                   18
               BMS             18
       BLDC                    20
                       (   )   22
                       MCU
MCU                     IC                                     ICE          Writer
      ISP Programmer


   MCU                                                               xxxxx141241412

                             (Open Mind)       (Team Work)
                                                         USB    MCU
   8051                        Arm® Cortex®-M0 M0+ M3
 32 MG32F      MCU



      2023                                          LDO  MOSFET
(PMIC)            (BMS)        BLDC        MCU                2024
       IC——                                        LIN CAN



                                   MCU




                                                                                      01
                   Cortex®-M3        Base Line     (p3)

                      (p3~4)
                                   Low-Power Line (p5)
       Arm®

     Cortex®-M                       Base Line     (p7)

                                     USB Line      (p7)

                 Cortex®-M0+/M0      Value Line    (p8)
                    (p5, p6~9)
                                     LCD Line      (p8)

                                    High CP Line   (p9)

                                     Touch Line    (p9)


                                     MGEQ          (p10, p11)


                                     MA82          (p13)
                    1T
                                     MG82          (p10~13)
     8051 MCU

                    1T                MA8          (p14)


                                     MG87          (p15)
                     12T/6T
                                     MPC89         (p15)


     USB MCU       8051            MA/MG84         (p16)


                                     MA11          (p17)

          IC     Delta-Sigma ADC      MAD          (p17)

                   LIN                MLT          (p17)


                   CAN                MCT          (p17)


                      BMS             MSE          (p18)
     Power IC
                      LDO             CR           (p19)


                                      CGH          (p20~21)

                                       MA853       (p20~21)
     BLDC MCU
                                      CGF          (p20~21)
                         (FOC)
                                      MDF          (p20~21)



02
M3
Arm® Cortex®-M3
M3    (MG32F103/104/157)          Arm® Cortex®-M3 32           Arm® Cortex®-M0 MCU
         Core       ; Flash   Cache




M3
 Core                                                  MG32F157
 Flash      Cache,                                     Flash 256KB    RAM 64KB
     Flash 96~256KB                                          CAN 2.0B                     15
                96MHz                                           AES-128
                USB 2.0                                  3       ADC 2
                                                             3 OPA    2   DAC
                                                             2 I2S
                                                             SDIO
                                                                100Pin               5V




                /POS




                                                                                               03
                     MCU
                     (I/O)
                                                                                   (           /                         )
                 (I2C)
                 (SPI/UART)                                                                             (                    )
                                                                                               (                     )
                 (PWM)
                                                                                                    (        )                                   (
                                                (                                      PWM (                 )


                               M3                                                           IC-CPD           ,                       :
                                                                                                                 ,
                           (                )



           M3                                                        &

                 ,                              (

                                                                                                                                             (




     Arm® Cortex®-M3 Base Line




                                    Flash   Data            20-Bit        12-Bit
                                                                     IO    ADC
                                    ROM     RAM
                                                                                                            UAR                  2

     MG32F103C9T6      2   3                2       72MHz    RTC     37                 2                   SP                           2           L   P
                                                                                                                         LED SE
                                                                                                            UAR                  2

     MG32F103CBT6      2   3                        72MHz    RTC     37                 2                   SP                           2           L   P
                                                                                                                         LED SE
                                                                                                            UAR                  2

     MG32F103RBT6      2   3                        72MHz    RTC                        2                   SP                           2           L   P
                                                                                                           LED SE
                                                                                                          UAR       2

     MG32F104KCU6      2   3                         MHz     RTC                        2               SP                                                   32
                                                                                                           LED SE
                                                                                                      UAR       2

     MG32F104CCU6      2   3                         MHz     RTC     37     -CH         2              SP             2

                                                                                                           LED SE
                                                                                                      UAR       2

     MG32F104RCT6      2   3                         MHz     RTC            -CH         2              SP             2
                                                                                                                                                     L   P
                                                                                                           LED SE
                                                                                                      UAR       2

     MG32F157CCU7      2   3                         MHz     RTC     37                 3                 PI,CA US ,SDIO
                                                                                                   CRC,OP     ,AE
                                                                                                      UAR       2

     MG32F157CCT7      2   3                         MHz     RTC     37                 3                 PI,CA US ,SDIO                             L   P
                                                                                                   CRC,OP     ,AE
                                                                                                       UAR        2

     MG32F157RCT7      2   3                         MHz     RTC                        3                 PI,CA US ,SDIO                             L   P
                                                                                                   CRC,OP     ,AE
                                                                                                       UAR        2

     MG32F157VCT7      2   3                         MHz     RTC                       3                  PI,CA US ,SDIO                             L   P
                                                                                                   CRC,OP     ,AE
           OPA
04
M0+
Arm® Cortex®-M0+
MG32L                                      32              MCU         Arm® Cortex®-M0+                                                       ...




M0+                    (MG32L003 only)

     24MHz                                    1.8mA
        (STOP)                            890nA
                            RTC (Real-Time Clock/Calendar)


                       (MG32L003 only)




Low-Power Line Arm® Cortex®-M0+
                                      Flash



                              64 KB
                                                L003F8P6           L003F8U6               L003K8U6          L003K8T6


                                                TSSOP20                QFN20                  QFN32          LQFP32

                                   Flash        Data                                 12-Bit
                                                                                IO                                             CCP*4 ISP/IAP
                                   ROM          RAM                                   ADC
                                                                                                                                                    TSSOP20
                       2.5V~                                  9+RTC                                      UART*2x2, LPUART,                           QFN20
      MG32L003*    1
                                   64KB         4KB    24MHz               16/28     15-CH       1*5
                                                                                                       I2C SPI, CRC16,1-Wire   6-CH    IAP   *3
                                                                                                                                                     QFN32
                       5.5V                                  LP Timer
                                                                                                                                                    LQFP32
*1                           *2
             ;                  UART          x2      SPI                   ;
*3
     Flash ROM            ; *4 CCP: I(         /   /PWM)     ;
*5 Low Voltage Detector (LVD:              ) / Voltage Comparator (ACMP:         )




Cost-Efficient Line Arm® Cortex®-M0+
                              Flash


                       64 KB                                     F04A064AL20            F04A064AT20         F04A064AL24

                       32 KB             F04A032AZ20                                    F04A032AT20


                                              QFN20                SSOP20                   TSSOP20           SSOP24

                                   Flash        Data                                 12-Bit
                                                                                IO                                             CCP*3 ISP/IAP
                                   ROM          RAM                                   ADC

                       2V~                                                                               UART*2x2,SPI,I2C,                           QFN20
     MG32F04A032*1                 32KB         3KB    48MHz       3        18       9-CH        1                             3-CH     IAP
                       5.5V                                                                                CRC32,UID                                TSSOP20
                                                                                                                                                    SSOP20
                       2V~                                                                               UART*2x2,SPI,I2C,
     MG32F04A064*1                 64KB         4KB    48MHz       5       18/22     12-CH       1                             4-CH     IAP         TSSOP20
                       5.5V                                                                            CRC32,UID, LED SEGx5                         SSOP24
*1
             ;
*2
   UART      x2       SPI                          ;
*3
   CCP: I(     /   /PWM)       ;                                                                                                                              05
M0
     Arm® Cortex®-M0
     M0       (MG32F02x)           Arm® Cortex®-M0 32   8051 MCU
          /                      PWM                     I/O       (ACMP)   SPI
     UART I2C              ...




 M0
                    (ADC)
                    (DAC)
                         (Capture W/ DMA)
               (Hardware Divider)
          USB 2.0 ( 15    ) ( MG32F02U   )
       ASB(   ARGB          ) ( MG32F02V   )
       PWM          96MHz (      2           PWM)

               CAN  LCD           ( MG32F02N   )
                    (NCO: Numerically Controlled Oscillator)
                (CCL: Configurable Custom Logic)
       EMB + 8080 LCD/OLED
                      (Keil Wizard, MG32CoGen)




06
Arm® Cortex®-M0 Base Line
                 Flash

          128 KB                                                                                            02A128AD64                 02A128AD80

           64 KB                                                                 02A064AD48                 02A064AD64

                          02A032XT20*
           32 KB
                           02A032AT20              02A032AY32                    02A032AD48

                            TSSOP20                     QFN32                       LQFP48                     LQFP64                   LQFP80

                              Flash     Data                                         12-Bit
                                                                           IO                                                            CCP*4 ISP/IAP
                              ROM       RAM                                           ADC
                                                                                                                                                          TSSOP20
                     1.8V~                                                                                 UART*2 x2, I2C,SPI/QPI,
    MG32F02A032*1          32KB         4KB      48MHz       5+RTC 17/29/44 12-CH                  2                                     4-CH       *3
                                                                                                                                                           QFN32
                     5.5V                                                                                     CRC32, DMA
                                                                                                                                                           LQFP48

                     1.8V~                                                                                 UART*5x7, I2Cx2,SPI*6 x4,                      LQFP48
    MG32F02A064*1          64KB         8KB      48MHz       7+RTC     44/59        16-CH          2                                     8-CH       *3
                     5.5V                                                                                  CRC32,DMA,DAC,EMB                              LQFP64

                     1.8V~                                                                                 UART*5x7, I2Cx2,SPI*6 x4,                      LQFP64
    MG32F02A128*1          128KB        16KB     48MHz       7+RTC     59/73        16-CH          2                                     8-CH       *3
                     5.5V                                                                                  CRC32,DMA,DAC,EMB                              LQFP80

*  MG32F02A032XT20                 -40~125°C;
*1          ;
*2    SPI     ;
*3  Flash ROM             ;
*4 CCP: (   /     /PWM)     ;
*5    UART      x3:    SPI    /    (UART 0/1/2     );
      UART      x4:         UART     (UART 4/5/6/7      );
*6    SPI     x1:    SPI/QPI/OPI (SPI 0   );
      SPI     x3:        SPI    (       UART 0/1/2      )




Arm® Cortex®-M0 USB Line
                                         Flash
                                     256 KB                                                   02U256AD64         02U256AD80

                                     128 KB      02U128AY48                                   02U128AD64         02U128AD80

                                      64 KB      02U064AY48          02U064AD48               02U064AD64


                                      32 KB       F241AY48            F241AD48


                                                   QFN48              LQFP48                      LQFP64           LQFP80


                             Flash     Data                                     12-Bit
                                                                      IO                                                                  CCP*3 ISP/IAP
                             ROM       RAM                                       ADC

                     2.4V~                                                       4-CH                      UART x2,I2C x2, SPI x2,                        QFN48
      MG32F241*1          ~ 32KB       4KB       48MHz 6+RTC          41                      2                                          24-CH    ISP
                     5.5V                                                       (10-Bit)                   USB,CRC32, DAC, ASB                            LQFP48
                                                                                                                                                           QFN48
                     1.8V~                                                                              UART*4 x7,I2C x2, SPI*5 x4,
    MG32F02U064*1         ~ 64KB       16KB      48MHz 7+RTC 41/56 16-CH                      2                                           8-CH   YES*2    LQFP48
                     5.5V                                                                              USB,CRC32, DMA, DAC, EMB                           LQFP64
                                                                                                                                                          QFN48
                     1.8V~                                                                              UART*4 x7,I2C x2, SPI*5 x4,
    MG32F02U128*1          128KB       16KB      48MHz 7+RTC 56/70 16-CH                      2                                           8-CH   YES*2    LQFP64
                     5.5V                                                                              USB,CRC32, DMA, DAC, EMB
                                                                                                                                                          LQFP80

                     1.8V~                                                                              UART*4 x7,I2C x2, SPI*5 x4,                       LQFP64
    MG32F02U256*1          256KB       32KB      48MHz 7+RTC 56/70 16-CH                      2                                           8-CH   YES*2
                     5.5V                                                                              USB,CRC32, DMA, DAC, EMB                           LQFP80

<                   >
*1          ;
*2  Flash ROM             ;
*3 CCP: (   /     /PWM)     ;
*4    UART      x3:    SPI    /    (UART 0/1/2     );
      UART      x4:         UART     (UART 4/5/6/7      );
*5    SPI     x1:    SPI/QPI/OPI (SPI 0   );
      SPI     x3:        SPI    (       UART 0/1/2      )                                                                                                           07
     Arm® Cortex®-M0 Value Line
                                  Flash



                       32 KB               02V032AT20                    02D032AZ20                    02V032AZ32               02V032AD32


                                               TSSOP20                         QFN20                        QFN32                  LQFP32

                                         Flash         Data                                   12-Bit
                                                                                       IO                                                   CCP*4 ISP/IAP
                                         ROM           RAM                                     ADC

                                1.8V~                                                                               UART*2 x3, I2C x2                        TSSOP20
      MG32F02V032*1                   32KB             4KB     48MHz    6+RTC         17/29   8-CH                  SPI/QPI,CRC32           6-CH      *3
                                                                                                                                                              LQFP32
                                5.5V
                                                                                                                      DMA,ASB                                 QFN32
                                2.7V~                                                                                UART*2, I2C, SPI
      MG32F02D032*1                   32KB             2KB     24MHz      3            13     4-CH                                          2-CH      *3
                                                                                                                                                              QFN20
                                5.5V                                                                                    DAC x2

 *1             ; *2        UART     x2:         SPI        (UART 0/1     );
 *3     Flash ROM              ; *4 CCP: (        /     /PWM)




     Arm® Cortex®-M0 LCD Line
                                       Flash


                                                                          02N129AD48                       02N129AD64
                            128 KB                                                                                                02H128AD80
                                               02N128AZ32                 02N128AD48                       02N128AD64             02N128AD80



                                                 QFN32                         LQFP48                       LQFP64                      LQFP80


                                        Flash     Data                                   12-Bit
                                                                                 IO                                                          CCP*3 ISP/IAP
                                        ROM       RAM                                     ADC
                                                                                                                                                             QFN32
                                1.8V~                                        29/44                           UARTx7,I2Cx2,SPIx4,LIN,LCD,                     LQFP48
      MG32F02N128      *1
                                      128KB       16KB        48MHz    5+RTC 59/73 16-CH               2                                     8-CH      *2
                                5.5V                                                                           CAN,OPA,DMA,CRC32                             LQFP64
                                                                                                                                                             LQFP80
                                1.8V~ 128KB                                                                  UARTx7,I2Cx2,SPIx4,LIN,LCD,               *2
                                                                                                                                                             LQFP80
      MG32F02H128*1                               16KB        48MHz    7+RTC     73      16-CH         2                                     8-CH
                                5.5V                                                                          OPA,DMA,CRC32,
                                1.8V~                                                                          UARTx3,I2Cx2, SPI, LIN,                       LQFP48
      MG32F02N1291                    128KB       16KB        72MHz    5+RTC 44/59 16-CH               2                                     8-CH      *2
                                5.5V                                                                            CANx2, DMA,CRC32                             LQFP64

     <                      >
     MG32F02N129:                       -40~125°C;
     *1          ;
     *2  Flash ROM                 ;
     *3 CCP: (   /     /PWM)




08
Arm® Cortex®-M0 High CP Line
                                       Flash

                              32 KB                                 005F6U7              005G6P7           005K6U7


                              16 KB               003F4P7           003F4U7

                                                 TSSOP20            QFN20              TSSOP28             QFN32


                                     Flash   Data                                12-Bit
                                                                           IO                                             CCP*3     ISP/IAP
                                     ROM     RAM                                  ADC

                      2V~5.5V                                                                         UART*2x2,SPI,I2C,                        QFN20
     MG32F003*1                      16KB        2KB   48MHz    5          18     8-CH                  CRC32,UID         4-CH
                                                                                                                                              TSSOP20
                                                                                                                                               QFN20
                                                                                                      OPAx2,USART,
     MG32F005*1      2.5V~5.5V       32KB        4KB   60MHz    7      19/26     10-CH         2                          4-CH        IAP     TSSOP28
                                                                                                     DMA,UID,HW Divider
                                                                                                                                               QFN32
*1
             ;
*2
   UART      x2       SPI                    ;
*3
   CCP: I(     /   /PWM)




Arm® Cortex®-M0 Touch Line
                                                   Flash



                                             64 KB          02T064AS28               02T064AZ32




                                                               SOP28                     QFN32

                              Flash     Data                                    12-Bit
                                                                      IO                                                     CCP*4 ISP/IAP
                              ROM       RAM                                      ADC

                      1.8V~                                                                          UART*2x2, SPI, I2C                       SOP28
 MG32F02T064*1                64KB      10KB       72MHz    6+RTC    26/30      8-CH       1                                 6-CH        *3
                      5.5V                                                                         CRC, DMA,Touch Key x16                     QFN32


*1          ;
*2    UART    :    SPI           ;
*3  Flash ROM          ;
*4 CCP: (   /   /PWM)




                                                                                                                                                        09
8051 MCU
 MGEQ1C064
                (      AEC-Q100 Grade 2       )
     64KB Flash 4KB SRAM                               CRC16
             2.4~5.5V                                  DMA   EMB(External Memory Bus)
                 36MHz                                 44 IO    LQFP48
     UART 4          QPI / SPI / IIC                         -40~105°C
        LIN bus                                                                 (OTA)
     ADC 16       1.0Msps (         )
     PWM 144MHz       Bit




                                          (In-Vehicle Control)




 MG82F6D




         4   UART,
                       (Duty Capture)           PWM
         EMB(External Memory Bus)     NAND/8080LCM
10
8051 MCU




      LED
                                 (BMS)



      UV




                                           : MGEQ1C064
                                         Flash ROM                 (16-Bit)     12-Bit ADC                        PCA             ISP
                                         Data RAM                    IO                                           PWM             IAP
                                          64KB                    5 + RTC        16-CH       UART*2x2,SPI,I2Cx2    1           7.5KB Max.
     MGEQ1C064*1         2.4V~5.5V                       36MHz                                                           *2                   LQFP48
                                                                                             S/W I2C,LIN,CRC16
                                           4KB                       44             3                             8-CH        63.5KB Max.*3

                  AEC-Q100 Grade 2                   (           : -40~105°C)
              ;
*1      SPI       ; *2   Watch    ; *3     S/W




                                                                                                                                                       11
     1T 8051                             Base Line
            Flash


     64 KB          6D64AL20                                                                                     6D64AZ48           6D64AD48         6D64AD64



     32 KB                                                                6D32AZ32              6D32AD32         6D32AZ48           6D32AD48

                                   6H17AS28           6P32AL28            6P32AZ32              6P32AD32

                    SSOP20             SOP28           SSOP28               QFN32                LQFP32          QFN48              LQFP48           LQFP64


                                 Flash



                           16 KB         6D17AS8                    6D17AZ20                    6D17AL20              6D17AT20



                                          SOP8                       QFN20                      SSOP20                TSSOP20



                                         Flash ROM                     Timer          12-Bit ADC
                                                                        (16-Bit)                                             PCA               ISP
                                         Data RAM                         IO                                                 PWM               IAP
                                                                                                                                                            SOP8
                                           16KB                       4 + RTC           8-CH         UART*2 x2, SPI, I2C      1             7.5KB Max.      QFN20
          MG82F6D17*1      1.8V~5.5V                   36MHz*5                                       S/W I2C, LIN,CRC16
                                                                                                                                      *3
                                                                                                                                                           SSOP20
                                           1KB                          5/17                                                 8-CH          15.5KB Max.*4   TSSOP20
                                           16KB                       4 + RTC           8-CH         UART*2 x2, SPI, I2C      1             7.5KB Max.
          MG82F6H17*1      1.8V~5.5V                   36MHz*5                                       S/W I2C, LIN,CRC16
                                                                                                                                      *3
                                                                                                                                                            SOP28
                                           1KB                            17                                                 8-CH          15.5KB Max.*4
                                                                                                        OPAx2, PGA,
                                           32KB                        6 + RTC          8-CH                               2                7.5KB Max.     SSOP28
                                                                                                     PD en/decoder,DMA
          MG82F6P32   *1
                           1.8V~5.5V                   32MHz   *5                                                                     *3                   QFN32
                                                                                                     UART*2 x2, SPI, I2Cx2
                                           2KB                          25/29               2                                                              LQFP32
                                                                                                      S/W I2C, CRC16/32 8-CH               31.5KB Max.*4
                                                                                                                                                           QFN32
                                           32KB                        4 + RTC          10-CH                                 1            7.5KB Max.      LQFP32
                                                                                                     UART*2 x2, SPI, I2Cx2
          MG82F6D32*1      1.8V~5.5V                   36MHz*5                                                                        *3
                                                                                                     S/W I2C, LIN,CRC16                                    QFN48
                                           2KB                          29/44               3                                8-CH          31.5KB Max.*4
                                                                                                                                                           LQFP48

                                           64KB                                                                                                            SSOP20
                                                                      5 + RTC           16-CH        UART*2 x4, SPI, I2Cx2 1                7.5KB Max       QFN48
          MG82F6D64*1      1.8V~5.5V                   36MHz*5                                                                        *3

                                           4KB                          44/59               3        S/W I2C, LIN,CRC16 8-CH               63.5KB Max.*4   LQFP48
                                                                                                                                                           LQFP64
     <                     >

     *1            SOP8     ;
     *2      SPI    ;
     *3      Watch    ;
     *4      S/W   ;
     *5      RC         12MHz 11.059MHz              12MHz RC                      ±1% 25       ±2% -40   ~105




12
1T 8051                                Base Line
                                    Flash


                               64 KB                                                                       5C64AC64


                                                                               5E32AD48
                               32 KB           5B32AD32
                                                                               5C32AD48


                                                LQFP32                            LQFP48                   LQFP64

                       Flash



                16 KB                                              6D16AS16         6D16AL20      6D16AZ20         6D16AL28



                               6B08AS8
                     8 KB      6B001AS8
                               6B104AS8        6B08AG10

                                  SOP8          MSOP10               SOP16          SSOP20         QFN20             SSOP28


                                                                         10-Bit
                                  Flash ROM                   (16-Bit)    ADC                                 PCA                 ISP
                                   Data RAM                     IO                                            PWM                 IAP

MG82F6B08*1                            8KB                   3 + RTC     6-CH          UART*2,SPI,LIN          1                3.5KB Max.
                                               16/22.12                                                                                      SOP8
MG82F6B001*1 2.4V~5.5V
                                                                                                                        *3
                                       1KB      MHz*6          6/8         1         S/W I2C,I2C,CRC16        4-CH            EEPROM 512B MSOP10
MG82F6B104*1                                                                                                                  IAP Default NA
                                                                                                                                              SOP16
                                       16KB                  3 + RTC     8-CH           UART*2,SPI,LIN         1               7.5KB Max.
 MG82F6D16      *1
                      1.8V~5.5V                 32MHz   *5                                                              *3                    SSOP20
                                       1KB                   13/17/25      1         I C,S/W I2C,CRC16
                                                                                      2
                                                                                                              6-CH            15.5KB Max.*4   QFN20
                                                                                                                                              SSOP28
                                       32KB                  3 + RTC     8-CH*7         UART*2x2,SPI           1                4KB Max.
 MA82G5B32*1 1.8V~5.5V                          25MHz*5                                                                 *3
                                                                                                                                              LQFP32
                                       2KB                      29                    ISO-7816,LIN,I2Cx2      8-CH            31.5KB Max.*4

                                       32KB                  5 + RTC     16-CH        UART*2x4,SPI/QPI         2               7.5KB Max.
 MA82G5C32*1 1.8V~5.5V                          32MHz                               I2Cx2,LIN,ISO-7816x3                *3                    LQFP48
                                       2KB                      44         3                                 12-CH            31.5KB Max.*4

                                       64KB                  5 + RTC     16-CH        UART*2x4,SPI/QPI         2               7.5KB Max.
 MA82G5C64*1 1.8V~5.5V                          32MHz*5                                                                 *3                    LQFP64
                                       4KB                      59         3        I2Cx2,LIN,ISO-7816x3     12-CH            63.5KB Max.*4

                                       32KB                  4 + RTC     8-CH         UART*2x2,SPI,I2C          1              7.5KB Max.
 MG82G5E32*1 1.8V~5.5V                          32MHz*5                                                                 *3
                                                                                                                                              LQFP48
                                        2KB                     44         2           S/W I2C,CRC16          8-CH            31.5KB Max.*4

*1         ,SOP8
*2   SPI    ;
*3   Watch    ;
*4   S/W    ;
*5   RC         12MHz 11.059MHz               12MHz RC                ±1%       25°C ±2% -40 ~85°C;
*6   RC           16MHz 22.12MHz               ±2% 25°C; ±3.8% -40°C~85°C




                                                                                                                                                       13
     1T 8051
                              Memory


                         64 KB                                                                     MA805/6


                         32 KB                                                                     MA805/6


                         24 KB                                                                     MA805/6

                         16 KB            MA803/4           MA803/4           MA803/4              MA807/8          MA816


                             8 KB         MA801/2
                                                                                                                                    Pin
                                           20 Pin            28 Pin              32 Pin             44 Pin          64 Pin         Count



                                          Flash ROM                       (16-Bit)        ADC                         PCA              ISP
                                           Data RAM                         IO                                       PWM               IAP
                                                                                                                                                     SOP20
           MA801              4.5V~5.5V        8KB                           2       8-Bit,8-CH                        1             3KB Max
                                                            25MHz                                       UART,SPI                                     PDIP20
           MA802              2.4V~3.6V       256B                          15                                        2-CH           8KB Max        TSSOP20
                                                                             2                                         1                            SOP20/28
           MA803              4.5V~5.5V      15.5KB                                  10-Bit,8-CH                                    3.5KB Max       PDIP20/28
                                                            25MHz                                       UART,SPI                                   TSSOP20/28
           MA804              2.4V~3.6V    256B+256B                     15/23/27                                    2/4-CH         15.5KB Max       LQFP32
          MA805-24      *1
                     4.5V~5.5V    24KB                                       3       10-Bit,8-CH                       1             4KB Max
                                                            24MHz*2                                    UARTx2,SPI             *4
                                                                                                                                                    LQFP44
          MA806-24*1 2.4V~3.6V 256B+1024B                                  37/41                                      6-CH          64KB Max*5

          MA805-32*1 4.5V~5.5V    32KB                                       3       10-Bit,8-CH                       1      *4
                                                                                                                                     4KB Max
                                                            24MHz                                      UARTx2,SPI                                   LQFP44
          MA806-32*1
                     2.4V~3.6V 256B+1024B                                  37/41                                      6-CH          64KB Max*5

          MA805-64*1 4.5V~5.5V    64KB                                       3       10-Bit,8-CH                       1      *4
                                                                                                                                     4KB Max
                                                            24MHz                                      UARTx2,SPI                                   LQFP44
          MA806-64*1 2.4V~3.6V 256B+1024B                                  37/41                                      6-CH          64KB Max*5

           MA807              4.5V~5.5V       16KB                           3                                                       4KB Max
                                                           12MHz*3                                          UART                                    LQFP44
           MA808              2.4V~3.6V    256B+256B                        41              1                         1-CH          16KB Max*5
                                              16KB                          3                                                        4KB Max
           MA816              4.5V~5.5V                    12MHz*3                                          UART                                    LQFP64
                                           256B+256B                        57              1                         1-CH          15.5KB Max*5


     *1             ;
     *2                 22.118MHz(            ±1%      , -20 ~50       ±2%      , -40 ~85          ±4%      );
     *3                 12MHz(             ±1%    , -20 ~50         ±2%    , -40 ~85            ±4%    );
     *4     Watch         ;
     *5




14
12T/6T 8051                                                                           RC
                            Flash

                          8 KB                                                                            L/E52AE40         L/E52AD44

                          6 KB                        L/E6051AS20         L/E6051AE20

                          4 KB      L/E04AG10

                                    MSOP10                SOP20                 PDIP20                     PDIP40            LQFP44


                                    Flash ROM                                              (16-Bit)                          PCA                     ISP
                                    Data RAM                                              IO                                 PWM                     IAP
                    L:2.4V~3.6V        8KB              48MHz @ 12T                       3                                    NA             3.5KB Max.        PDIP40
    MG87FL/E52*                                                                                                     UART
                    E:4.5V~5.5V       256B              24MHz @ 6T                   32/36                                     NA             S/W setting       LQFP44
                    L:2.4V~3.6V        6KB              48MHz @ 12T                       2                                    NA             3.5KB Max.        PDIP20
MG87FL/E6051*                                                                                               1       UART
                    E:4.5V~5.5V       256B              24MHz @ 6T                        17                                  1-CH            S/W setting       SOP20
                    L:2.4V~3.6V        4KB                                                2                                    NA               1.5KB
    MG87FL/E04                                       22.118MHz/Int RC                                       1       UART                                        MSOP10
                    E:4.5V~5.5V       256B                                                7                                   1-CH            S/W setting

*      6          RC (       ±1%       , -20   ~50        ±2%     ,-40   ~85               ±4%        )     : 6M/11.059M/12M/22.118M/24M/24.576MHz




12T/6T 8051                                                                                    RC
                                                Flash


                                         64 KB             L/E515AE40                                     L/E515AD44


                                         32 KB             L/E58AE40                                      L/E58AD44


                                                                                                          L/E54AD44
                                         16 KB
                                                           L/E53AE40                                      L/E53AD44


                                            8 KB           L/E52AE40                                      L/E52AD44

                                                            PDIP40                                          LQFP44

                           Flash ROM                                           (16-Bit)                               PCA                              ISP
                           Data RAM                                       IO                                          PWM                              IAP
               L:2.4V~3.6V     8KB                 48MHz @ 12T             3                                                                         4KB Max.    PDIP40
    MPC89L/E52                                                                                             UART
               E:4.5V~5.5V    512B                 24MHz @ 6T            32/36                                                                       6KB Max.    LQFP44

                   L:2.4V~3.6V      15KB           48MHz @ 12T             3                                                                         4KB Max.    PDIP40
    MPC89L/E53                                                                                             UART
                   E:4.5V~5.5V      512B           24MHz @ 6T            32/36                                                                                   LQFP44

                   L:2.4V~3.6V      16KB           48MHz @ 12T             3                                                                         4KB Max.
    MPC89L/E54                                                                                             UART                                                  LQFP44
                   E:4.5V~5.5V      1280B          24MHz @ 6T            32/36                                                                   46KB Max.

                   L:2.4V~3.6V      32KB           48MHz @ 12T             3                                                                         4KB Max.    PDIP40
    MPC89L/E58                                                                                             UART
                   E:4.5V~5.5V      1280B          24MHz @ 6T            32/36                                                                   30KB Max.       LQFP44

                   L:2.4V~3.6V      63KB           48MHz @ 12T             3                                                                         4KB Max.    PDIP40
    MPC89L/E515
                                                   24MHz @ 6T                                              UART
                   E:4.5V~5.5V      1280B                                32/36                                                                                   LQFP44




                                                                                                                                                                          15
     8051 USB
                                    Memory


                              64 KB             MG84G564AD48                          MG84G564AD64


                                              MG84FL54RBDAD48                                          GROUP A     USB Audio
                              16 KB
                                               MG84FL54BDAD48                                          GROUP B     USB With 12-bit ADC
                                                                                                                                          Pin
                                                       48 Pin                               64 Pin                                       Count


     MG84/MA84                                 (USB FS )
                                    Flash ROM                           (16-Bit)      ADC                       PCA            USB       ISP
                                    Data RAM                        IO                                          PWM                      IAP
                                      16KB                           3                           USB, UART,                            4KB Max.
          MG84FL54BD 2.7V~3.6V                       24MHz                                                                      4                  LQFP48
                                      832B                          36                          TWI(I2C), SPI                         15KB Max.
                                      16KB                           3                           USB, UART,                            4KB Max.
     MG84FL54RBD 2.7V~3.6V                           24MHz                                                                      6                  LQFP48
                                      256B                          31                          TWI(I2C), SPI                         15KB Max.
                                      64KB                           4             12-Bit, 8-CH USB, UARTx2,      1                    4KB Max. LQFP48
          MG84G564 *1   2.0V~5.5V                    32MHz*2                                                            *4
                                                                                                                               11
                                      4352B                        41/55                        TWI(I2C), SPI   6-CH                 63.5KB Max.*5 LQFP64
     *1           ;
     *2              12MHz(         ±1%       ,-40   ~85        ±1.5%      ,USB        ±0.25%    );
     *3      SPI   ;
     *4      Watch    ;
     *5




16
              IC
USB
                             USB                                          UART, I2C, SPI                        GPIO        PWM                              USB Bridge



USB                                                        LED            EEPROM SPI/I2C                     ……




                               USB

                                   *1
      MA111    2.4V~5.5V                USB HID                                              UART, SPI Master, TWI(I2C) Master, GPIO                     SOP16, QFN16
                                   *1   USB   UART                                                           Virtual COM
      MA112    3.0V~5.5V                                                                                                                                 SOP16, QFN16
                                           MS Windows                                                         (TXD/RXD)
                                        USB         UART                                               Virtual COM(TXD/RXD),
                                   *1
      MA113    3.0V~5.5V                RS-232                            RS-485                       RS-232                                            SOP16, QFN16
                                           MS Windows                                                  RS-485
*1
               12MHz(           ±1%     ,-40     ~85         ±1.5%        ,USB       ±0.25%       )




Delta-Sigma ADC
ADC (                      )                                                                      ADC                                                                     24


                        (PGA)


                                                                                                                  ......




                                                                 ENOB            ADC                  AD Rate
                                        Power(mA)                                                                     PGA
                                                                 (Bits)            (diff)               (Hz)
     MAD2402       2.5V~5.5V                  0.7                19.8                1                 1280            128          SIF (Serial Interface)     SOP8, DIP8

    MAD2402B       2.5V~5.5V                  0.1                 21                 1                 1280            128          SIF (Serial Interface)     SOP8, DIP8
                                                                                                                                                               SSOP20W
     MAD2418            5V                     7                  23                 4                 30K             64                    SPI               SSOP28W
     MAD2408       2.5V~5.5V                   1                  22                 4                  2K             128          SIF (Serial Interface)       SOP16
<                  >




LIN                     /CAN
                                                                                      Data Rate
                                                                                                         LDO
                                                                                        (bps)                                (°C)
                  MLT1021               LIN2.x                     9V~27V                   20K                            -40 ~ 125          SOP8

                MCT1042T-3 CAN2.0x/CAN-FD                         3.3V~5V                   5M                             -40 ~ 125          SOP8



                                                                                                                                                                               17
Power IC
     BMS
               (Battery Management System: BMS)
                                                       BMS                     MCU                   UI




     BMS
                                  (MSE)                       (SOC)
                 (SOH)
                                               /   /


                  (      )


     BMS (MSE03GM1) GUI
                                  /        /


                                                   SOC/SOH




 BMS




 Power IC (BMS)



               MSE03GM1                            3             NCA        8.1V ~ 12.75V   UART, I²C     LQFP48
                                 (Gauge)
                                                              NCM, NCA,
               MSE01PC1                            1                         1.9V ~ 5V      NFC, UART     QFN20
                             (Battery Passport)              LTO, LiFePO4

               MSE06GC1                            6         NCA, LiFePO4     6V ~ 30V         I²C        QFN32
                                 (Gauge)
           <                 >



18
LDO
                 (Low-dropout regulator: LDO)                                                                                                         LDO
                                                                               :          EN PIN        LDO                  PSRR                             (   1KHz)
                 IQ    (            )


LDO
          EN PIN             LDO              ,
 (        :     EN Pin                            EN pin          ,         SOT 235              )

              PSRR                        (            1KHz)
     IQ                      ,



LDO                    /             /                                                                         LDO
                                 LDO
 -                    100V

 -                    5V/3.3V (CR2105:                                )

 -                    0.3A



          PLDO = (Vin – Vout ) x Iout
                                                                                           (W)
              Vout = 3.3 V       Iout =50mA                       SOT233             0.4                                             (BMS)
                                                                  SOT235             0.4
     Vin = 9 V             LDO           0.285W                   SOT893             1.8
                                                                 SOP8-EP             2.2
      Vin = 15 V           LDO           0.585W

                                         SOT893            SOP8-EP



Power IC (LDO)
                                                           Adj                               CR2105       CR2105


                                                                          CR78L05                                     CR78L05

                                                                          CR2202                                         CR2202
                                                           5V
                                                                          CR2402             CR2402                      CR2402
                                                                                             CR2601       CR2601         CR2601


                                                                          CR78L33                                     CR78L33

                                                                          CR2202                                         CR2202
                                                           3.3V
                                                                          CR2402             CR2402                      CR2402

                                                                          CR2503             CR2503

                                                                                             CR2601       CR2601         CR2601

                                                                          SOT233             SOT235       SOP8-EP     SOT893                            *1 Adj:

                           Min.           Max.               IOUT                  VOUT           IQ       VLINE    VLOAD          PSRR        COUT
                                                                                                                                                         EN
                           VIN(V)         VIN(V)            (mA)                   (V)           (uA)     (%)       (%)           @1KHz (dB)   (uF)

      CR78L33                                                                                                                                                     SOT233
                             7                    30         100               3.3/5             300          0.3   0.3              84        0.1
      CR78L05                                                                                                                                                     SOT893
                                                                                                                                                                  SOT235
          CR2105             7                100             50               Adj*1             23       0.18      1.25             65        10
                                                                                                                                                                  SOP8-EP
                                                                                                                                                                  SOT233
          CR2202             2.7                  24         150               3.3/5             1.5      0.06      0.15             80         1                 SOT893
                                                                                                                                                                  SOT233
          CR2402             2.7                  40         250               3.3/5             1.5      0.06      0.6              80         1                 SOT235
                                                                                                                                                                  SOT893
                                                                                                                                                                  SOT233
          CR2503             2.5                  6          300                   3.3           0.5          0.6    1               60         1                 SOT235
                                                                                                                                                                  SOT235
          CR2601             2.7                  60         150               3.3/5             2.8      0.01      1.5              60         1                 SOT893
                                                                                                                                                                  SOP8-EP   19
BLDC
     BLDC
     8   /32        BLDC                 ASIC          600V       ;   3 PMSM/BLDC FOC




     Arm® Cortex®-M0 BLDC:                                                (ex: MDF121A)

     MDF1x1A:
       32 M0             60MHz            :
                               /
                   FOC
               40V ~ 600V                     5V LDO
         2 OPA
            MOS                P+N / N+N
               /           :


     8051 core BLDC:                                                      (ex: CGH021A)

         CGH0x1A:                   IC
         CGF0x2A: FOC          *


                   FOC                    ,                   ,



                                                                           (*MDE: Motor Driving Engine)
                          (MDE)


         MOSFET            P+N / N+N
     FOC




     (*FOC               Field-Oriented Control)



                     :




20
BLDC

                                         600V            CGH081A                     CGF082A      MDF181A


                                         200V            CGH061A                     CGF062A      MDF161D


                                         150V                                                     MDF151A

                                         40V             CGH021A                     CGF022A      MDF121A


                                         12V               MA853


                                                         CGH001A                     CGF002A      MDF101A

                                                                                               (FOC)

Arm® Cortex®-M0 BLDC
                                                                                          ADC     Capture
                                                  VIN      LDO             VDD                     16-Bit OPA
                                                                                                              *1
                                                                                         12-Bit
                                                                                                                                 TSSOP28
      MDF101A      FOC                            5V                  2.5~5.5V   60MHz   10 CH     5 CH     2       -40   ~105
                                                                                                                                  QFN32

      MDF121A      FOC           40V    P+N       40V    5V/30mA      2.5~5.5V   60MHz   10 CH     5 CH     2       -40   ~105    QFN32

                                                  21V 12V/300mA
      MDF151A      FOC           150V   N+N                           2.5~5.5V   60MHz   10 CH     5 CH     2       -40   ~105    QFN40
                                                  13V 5V/30mA
                                                 150V 12V/160mA                                                                   QFN32
      MDF161D*2    FOC           200V   N+N                           2.5~5.5V   60MHz   10 CH     5 CH     2       -40   ~105
                                                 200V 5V/30mA                                                                     QFN40
      MDF181A      FOC           600V   N+N       15V    5V/30mA      2.5~5.5V   60MHz   10 CH     5 CH     2       -40   ~105   LQFP48
                     *1   OPA:           *2
                                              MDF161D    DC-DC converter




ASIC BLDC
                                                  VIN                                     ADC     Capture
                                                           LDO             VDD
                                                                                                   16-Bit OPA
                                                                                                              *1
                                                                                         12-Bit

                  180°/150°
        MA853     Sine-wave      12V    N+N      9~16V      5V        2.0~5.5V   48MHz   2 CH      2 CH     2       -40   ~105    QFN32




8051 core BLDC
                                                                                          ADC     Capture
                                                  VIN      LDO             VDD                              OPA*1
                                                                                         10-Bit    16-Bit

                                                                                                                                 SSOP28
      CGH001A       Hall                          5V                  4.5~5.5V   48MHz    8 CH     1 CH     1       -40   ~105
                                                                                                                                 QFN32

                                                                                                                                 SSOP28W
      CGH021A       Hall         40V    P+N       40V    5V/30mA      4.5~5.5V   48MHz    8 CH     1 CH     1       -40   ~105
                                                                                                                                  QFN40

      CGH061A       Hall         200V   N+N       15V    5V/30mA      4.5~5.5V   48MHz    8 CH     1 CH     1       -40   ~105   LQFP48


      CGH081A       Hall         600V   N+N       15V    5V/30mA      4.5~5.5V   48MHz    8 CH     1 CH     1       -40   ~105   LQFP48


      CGF002A      FOC                            5V                  4.5~5.5V   48MHz    8 CH     1 CH     1       -40   ~105   LQFP48

      CGF022A      FOC           40V    P+N       40V    5V/30mA      4.5~5.5V   48MHz    8 CH     1 CH     1       -40   ~105   LQFP48


      CGF062A      FOC           200V   N+N       15V    5V/30mA      4.5~5.5V   48MHz    8 CH     1 CH     1       -40   ~105   QFN40
                                                                                                                                 LQFP48

      CGF082A      FOC           600V   N+N       15V    5V/30mA      4.5~5.5V   48MHz    8 CH     1 CH     1       -40   ~105   LQFP48

 *1   OPA:                                                                                                                                 21
                  8bit        : Keil IDE                            : OCD, M-Link
                  32bit         : Keil IDE, VS Code, Eclipse        (MP)          : U1-Plus
                                       KeilC, GCC, SDCC                 : Hi-Lo, Xeltek, Elnec
                  M0                         : CoGen, Wizard      ICP/IAP/ISP,      /




         IDE                                                                             MP




                                           API           :
                  ADC/DAC/ACMP/CAN/LIN/Timer/PWM/RTC/          ESD : 8KV Grade for HBM
                  SPI/I2C/CCL/CRC/AES128/IEC60730/ARGB
                                                                     450V for MM
                                                                     1KV for CDM
                         96    UID




                     :
                     MCU


                 01(HW)
     *       M-Link                    U1 Plus-D
     *                   EVB …

                     02(SDK)
         *        700     Driver API
         *

                      03(TOOL)
             *Keil Wizard/CoGen
             *

                          04(DOC)
                 *
                 *




22
        : MG32CoGen
                   (MG32CoGen)
                ADC UART TIMER   SPI   LCD   CAN   ASB…
            ,
                        I/O




        : Keil Wizard
8051 / M0




                                                          23
                                            Arduino®-Throne
                  Arduino®-Throne


       1    Arduino® IDE

       2 32-Bit MCU                        36MHz

       3 128KB Flash        16KB SRAM
       4         3.3V/5V
       5         47     GPIO

       6

       7    I2C/SPI/UART              USB 2.0
                                                                                                          Arduino®-Throne
       8     7   8      PWM

       9     16 ADC                                                         (                   : Megawin               )
                                                                                            :          Megawin Arduino®
      10    1    12 DAC




     Arduino®-Throne                Arduino® UNO R3

                                        Arduino®                                   Megawin
                                        Arduino® UNO R3               Arduino®-Throne (TH244A)
                                       8-bit AVR®, 16MHz             32-bit Arm® Cortex®-M0, 36MHz
                      MCU
                                     MCU (AVR ATmega328P)             MG32F02U128 (64-pin LQFP)

            Flash / EEPROM / SRAM       32KB / 1KB / 2KB                    128KB / - / 16KB

                                               5V                               3.3V/5V

                                        I2C SPI     UART                I2C SPI       UART        USB

                                            Arduino®                            Arduino® Keil
                  I/O                        20mA                      40mA (5V) / 13mA (3.3V)

                      I/O                      14           47   (     46               ,                       )

                                               0                                    1

                                               2
                                             6-CH                       7-CH, 8-bit             1KHz
                        PWM                                                                        300Hz~5KHz
                                                                              16-CH, 10-bit
                            ADC            6-CH, 8-bit
                                                                         (8-bit/10-bit/12-bit       )
                                           COM                                   COM




24
       Arm®            Arm®
  Cortex®-M0+/M0     Cortex®-M3
USB        8051    Power IC       BLDC




                                         25
                       USB
           +              Keil RVMDK

      M-Link
         (TH185)




                       USB


                                      ,                         ID
       U1 Plus-D
                                             IAP
         (TH200)                                 ( ISP Code )
                       LCD




                       M0 MCU (MG32F02U128)                     36MHz
                       128KB Flash    16KB SRAM
     Arduino -Throne
            ®
                             USB2.0
                             ADC, DAC, I2C, SPI, UART
       (TH244A001)     Arduino 47 GPIO       ;        2.54mm
                               Arduino IDE




26
                                          MDF101A                MDF121A EVB
MDF           MDF101A
      + 40V P/N Gate Driver EVB   + 600V N/N Gate Driver EVB   (TH276A/TH277A)




          MDF151A EVB                   MDF161D EVB
        (TH282A/TH284A)                   (TH298A)




                                                                                 27
     AB   COB                       AC        LQFP64 (10 x 10mm)                AD         LQFP (others)
     AE   PDIP                      AF        PQFP                              AG         MSOP
     AL   SSOP                      AM        TQFP                              AP         PLCC
     AS   SOP                       AT        TSSOP                             AY         QFN (5 x 5m     )
     HS   SOP (            )        AK        TOxxx                             AZ         QFN (4 x 4m     )
     AR   SOT                       AI        Ink die                           AN         DFN
     AW   Wafer                     WL        SSOPW (209mil Outline Dimensions) AH         DICE
     WP   WLCSP




               M0 (M0+)
                                          MG      32       F       0      2A         128    AD     48
            megawin
            Device family
            32 = 32 bit MCU

            Application family
            F = Mainstream
            L = Low power

            MCU series
            0 = Arm® Cortex®-M0/M0+

            Device series
            A = Base Line      V/D = Value Line
            U = USB Line       H/N = LCD Line          T = Touch Line


            Program memory size
            128 = 128 Kbyte
            064 = 64 Kbyte
            032 = 32 Kbyte
            016 = 16 Kbyte


            Package type
            AS = SOP
            AD = LQFP
            AL = SSOP
            AT = TSSOP
            AY = QFN(5 x 5mm )
            AZ = QFN(4 x 4mm )

            Pin count
            80 = 80 pins
            64 = 64 pins
            48 = 48 pins
            32 = 32 pins
            20 = 20 pins



28
  - M0/M0+/M3
                                  MG    32   F    1    0   3   C   B    T    6
megawin
Device family
32 = 32 bit MCU

Application family
F = Mainstream
L = Low Power

MCU series
1 = Arm® Cortex®-M3
0 = Arm® Cortex®-M0/M0+

Pin count
V = 100 pins        C = 48 pins    G = 28 pins
R = 64 pins         K = 32 pins    F = 20 pins

Flash memory size
C = 256 Kbyte       9 = 96 Kbyte   6 = 32 Kbyte
B = 128 Kbyte       8 = 64 Kbyte   4 = 16 Kbyte

Package type
T = LQFP       P = TSSOP    U = QFN

Temperature
6 = -40°C to 85°C
7 = -40°C to 105°C



                MCU
                                       MG    E    Q1   C   064     AD   48
     megawin
     MCU type
     E = 8 bit
     T = 32 bit

     Automotive Grade
     Q = AEC-Q series
     1 = Product series

     Temperature
     A = -40°C to 150°C
     B = -40°C to 125°C
     C = -40°C to 105°C

     Flash memory size
     Package type
     AD = LQFP

     Pin count
     48 = 48 pins
                                                                                 29
              Megawin Technology Co.,Ltd.


   :                        8 7   1            :                          B905
   :+886-3-5601501                             :+86-755-8343-5163
   :+886-3-5601510                             :+86-755-8384-3144
E-mail:sales@megawin.com.tw                 E-mail:sales@megawin.com.tw
