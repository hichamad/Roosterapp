create table Legend
(
    number int(5)      not null,
    sense  varchar(25) not null
);

create table gebruiker
(
    id              int(5) auto_increment
        primary key,
    firstName       varchar(25)      not null,
    lastName        varchar(25)      not null,
    email           varchar(45)      not null,
    pass            varchar(100)     not null,
    phone           varchar(20)      not null,
    birth           date             not null,
    profielFotoLink varchar(500)     null,
    isWerkgever     bit              not null,
    roosterId       int(4)           null,
    verificatie     bit default b'0' not null
);

create table authSessions
(
    refreshToken  varchar(300) not null
        primary key,
    gebruikerId   int(5)       null,
    tokenCreated  timestamp    null,
    tokenLastUsed timestamp    null comment 'If The difference between now and this value the user is offline',
    constraint authSessions_gebruiker_id_fk
        foreign key (gebruikerId) references gebruiker (id)
            on delete cascade
);

create table koppelCode
(
    koppelCode int    not null
        primary key,
    roosterId  int(4) not null
);

create table rooster
(
    roosterId   int(4) auto_increment
        primary key,
    roosterName varchar(35) not null
);

create table roosterItems
(
    itemId    int auto_increment
        primary key,
    userId    int           not null,
    datum     date          not null,
    beginTijd time          not null,
    eindTijd  time          not null,
    state     int default 1 null,
    constraint items_gebruiker_id_fk
        foreign key (userId) references gebruiker (id)
            on delete cascade
);

create table Notifications
(
    id            int auto_increment
        primary key,
    userId        int(5)               not null,
    messageType   int(2)               not null,
    roosterId     int(4)               not null,
    roosterItemId int                  null,
    isForBoss     tinyint(1) default 0 not null,
    secondUser    int                  null,
    constraint Notifications_roosterItems_itemId_fk
        foreign key (roosterItemId) references roosterItems (itemId)
            on delete cascade,
    constraint table_name_gebruiker_id_fk
        foreign key (userId) references gebruiker (id)
            on delete cascade
);

create index table_name_bedrijf_id_fk
    on Notifications (roosterId);

create table roosterStructuur
(
    id               int auto_increment
        primary key,
    roosterId        int          not null,
    dagNummer        int(1)       null comment 'Note: Sunday is 0, Monday is 1, and so on.',
    titel            varchar(100) not null,
    aantalWerknemers int          null,
    beginTijd        time         not null,
    eindTijd         time         not null,
    color            char(7)      null,
    constraint structuur_rooster_roosterId_fk
        foreign key (roosterId) references rooster (roosterId)
);
