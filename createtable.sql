/*CREATE TABLE `****` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ticker_id` int(11) NOT NULL,
  `last` decimal(12,3) DEFAULT NULL,
  `change` decimal(12,3) NOT NULL,
  `open` decimal(12,3) DEFAULT NULL,
  `high` decimal(12,3) DEFAULT NULL,
  `low` decimal(12,3) DEFAULT NULL,
  `vol` int(11) unsigned DEFAULT NULL,
  `trade` int(11) NOT NULL,
  `value` decimal(12,3) DEFAULT NULL,
  `prev` decimal(12,3) NOT NULL,
  `ref` decimal(12,3) NOT NULL,
  `prev_date` date NOT NULL,
  `bid` decimal(12,3) DEFAULT NULL,
  `ask` decimal(12,3) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1857 DEFAULT CHARSET=utf8;*/

CREATE TABLE `****` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticker_id` INT UNSIGNED NOT NULL,
  `price` DECIMAL(12,3) UNSIGNED NOT NULL,
  `quantity` INT NOT NULL,
  `datetime` date NOT NULL,
  `timestamp` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`));
  
  
CREATE TABLE `****` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticker_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `****` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticker_id` INT NOT NULL,
  `price` DECIMAL(12,3) UNSIGNED NOT NULL,
  `bid` INT UNSIGNED NULL,
  `bid_qty` INT UNSIGNED NULL,
  `ask` INT UNSIGNED NULL,
  `ask_qty` INT UNSIGNED NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`));


CREATE TABLE `****` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `headline` VARCHAR(255) NULL,
  `url` VARCHAR(255) NULL,
  `date` DATETIME NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`));
