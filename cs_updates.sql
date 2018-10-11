/*
 Navicat Premium Data Transfer

 Source Server         : VPS
 Source Server Type    : MySQL
 Source Server Version : 50560
 Source Host           : localhost:3306
 Source Schema         : league

 Target Server Type    : MySQL
 Target Server Version : 50560
 File Encoding         : 65001

 Date: 11/10/2018 17:12:57
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cs_updates
-- ----------------------------
DROP TABLE IF EXISTS `cs_updates`;
CREATE TABLE `cs_updates`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Compact;

SET FOREIGN_KEY_CHECKS = 1;
