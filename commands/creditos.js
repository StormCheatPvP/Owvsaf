const Discord = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const config = new JsonDatabase({ databasePath:"./config.json" });

module.exports = {
    name: "creditos",
    run: async(client, message, args) => {
        const embed = new Discord.MessageEmbed()
        .setTitle(`Olá, seja bem-vindo(a) ao ${config.get(`title`)}`)
        .setDescription(`comando de credito `)
        .setColor(`#ffffff`)
        .setImage(`https://media.discordapp.net/attachments/1081018256170696747/1081025864025772102/standard_-_2023-03-02T223026.253.gif`)

    }};

    interaction.followUp( { embeds: [embed], ephemeral: true})