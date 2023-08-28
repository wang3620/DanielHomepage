create table ip_location_history
(
    location    longtext collate utf8mb4_bin          null,
    created_at  timestamp default current_timestamp() not null,
    id          bigint auto_increment
        primary key,
    raw_headers text                                  null
);