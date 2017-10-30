/**
 * 
 */

const SPRITES = "sprites.png";

const SPRITE_SIZE = 64;

const SPRITE_IMG_Y = 512 * 2;
const SPRITE_IMG_X = 1792 * 2;

const ENTRY_LEN = 15;

const POKEMON_NUM = '1';
const GENDER = 2;
const SHINY = 3;
const KB = 4;

const HP = 5;
const ATK = 6;
const DEF = 7;
const SPATK = 8;
const SPDEF = 9;
const SPD = 10;
const OTID= 11;
const OTNAME = 12;
const NATURE = 13;
const HIDDEN_POWER = 14;
const NOTES = 15;

const DASH = '&#8212;';

var currentSelected;

function pad (str, max) {
	  str = str.toString();
	  return str.length < max ? pad("0" + str, max) : str;
	}

function getTradeSheet()
{
	$("<script>", {"src" : "https://spreadsheets.google.com/feeds/cells/"+TRADE_SHEET_KEY+"/od6/public/values?alt=json-in-script&callback=readTradeSheet","type": "text/javaScript","id":"json"}).appendTo($("body"));
}

function readTradeSheet(json)
{
	
	var map = [];
	var entry = json.feed.entry;
	
	var rows = 0;
	
	for(var i = 0; i < entry.length ; ++i)
	{
		var cell = entry[i].gs$cell;
		var row = parseInt(cell.row);
		if(!(row in map)) map[row] = {};
		map[row][parseInt(cell.col)] = cell.$t;
		rows = rows < row ? row : rows;
	}
	
	
	var list = $("#pokemon-list");
	for(var i = 0; i < rows ; ++i)
	{
		var mapEntry = map[i + 1];
		
		var id = parseInt(mapEntry[POKEMON_NUM]);
		
		if(isNaN(id))
		{
			alert("Unexpected entry found @ Row " + i +"! Skipping.");
			continue;
		}
		
		var shiny = mapEntry[SHINY] == 'TRUE' ? true : false;
		var kb = mapEntry[KB] == 'TRUE' ? true : false;
		
		var x = SPRITE_IMG_Y - (id % 16) * SPRITE_SIZE;
		var y = SPRITE_IMG_X - Math.floor(id / 16) * SPRITE_SIZE;
		
		var string = '<li class="pokemon '+ (i % 2 == 0 ? 'even' : 'odd') + '">';
		
		string += '<div class="pokemon-entry spriteMagic">';	
		//Sprite
		string += '<div class="pokemon-sprite-small-shadow" style="background-image: url(' + SPRITES + '); background-position:'+ x + 'px ' + y + 'px;"></div>';
		string += '<div class="pokemon-sprite-small" style="background-image: url(' + SPRITES + '); background-position:'+ x + 'px ' + y + 'px;"></div>';
		string += '</div>';
		//Name
		string += '<div class="pokemon-entry pokemon-name">'+POKEMON[id]+'</div>';
		
		var gender = mapEntry[GENDER];
		
		string += '<div class="pokemon-entry '+ ((gender != 'M' && gender != 'F') ? 'GL' : gender)   +'">'+ (gender == 'F' ? '&#9792' : (gender == 'M' ? '&#9794': 'N/A')) + '</div>';
		
		string += '<div class="pokemon-entry ' + (shiny ? 'shiny-star' : 'plain-star') + '"></div>';
		
		string += '<div class="pokemon-entry ' + (kb ? 'kb' : 'nkb') + '">'+(kb ? '&#11039;' : '&#11040;')+'</div>';
		//&#11039;
		
		for(var ivs = HP; ivs <= SPD; ivs++)
		{
			var val = mapEntry[ivs];
			if(isNaN(parseInt(val)))
			{
				string += '<div class="pokemon-entry iv">X</div>';
			}else
			{
				string += '<div class="pokemon-entry '+ (val == 31 ? 'iv-p' : 'iv') +'">'+ val +'</div>';
			};
		}
		
		string += '<div class="more-info">';
		
		string += '<div class="more-info-entry"><span>Ball Type: </span>' + (mapEntry[OTNAME] == null ? '???' : mapEntry[OTNAME]) +'</div>';
		string += '<div class="more-info-entry"><span>Ability: </span>' + (mapEntry[OTID] == null ? '???' : pad(mapEntry[OTID],1)) +'</div>';
		string += '<div class="more-info-entry"><span>Nature: </span>' + (mapEntry[NATURE] == null ? '???' : mapEntry[NATURE]) +'</div>';
		string += '<div class="more-info-entry"><span>Hidden Power: </span>' + (mapEntry[HIDDEN_POWER] == null ? '???' : mapEntry[HIDDEN_POWER]) +'</div>';
		
		string += '</div>';
		
		if(mapEntry[NOTES] != null)string += '<div class="even-more-info">'+mapEntry[NOTES]+'</div>';
		
		string += '</li>';
		
		
		list.append(string);
	};
	
	$(".loader-container").hide();
}

$(document).ready(
		function() {
			
			getTradeSheet();
			
			$(document).on('click touchstart','li.pokemon',function()
					{
						if(currentSelected != null)
						{
							currentSelected.removeClass("selected");
							currentSelected.removeAttr("style");
						}
						if(currentSelected != null && currentSelected[0] == $(this)[0])
						{
							currentSelected = null;
							return;
						}
						$(this).toggleClass("selected");
						var $moreinfo = $(this).find(".even-more-info");
						var padding = 40 + ($moreinfo != null ? $moreinfo.outerHeight() : 0);
						$(this).css({"padding-bottom" : padding + "px"})
						currentSelected = $(this);
					});
			
			$( 'input[name="search"]' ).keyup(function()
			{
				$this = $(this);
				if(currentSelected != null) currentSelected.removeClass("selected");
				var $ul = $("#pokemon-list .pokemon");
				var i = 0;
				$ul.each(function()
						{
							$li  = $(this);
							if($li.find(".pokemon-name").text().toLowerCase().indexOf($this.val().toLowerCase()) < 0) 
							{
								$li.hide();
							}
							else 
							{
								$li.show();
								if(i % 2 == 0) $li.removeClass('odd').addClass('even'); else $li.removeClass('even').addClass('odd');
								i++;
							}
							if(i == 0) $(".notfound").show();
							else
							{
								$(".notfound").hide();
							}
						});
			});
			
			$( document ).on( 'keydown', function( ev ) 
				{
			    	var nodeName = ev.target.nodeName;

			    	if ( 'INPUT' == nodeName || 'TEXTAREA' == nodeName ) {
			    		return;
			    }
			    	var $input = $( 'input[name="search"]' );
			    	$input.val('').trigger('focus'); 
			    	$input.keypress();
			    });
			    
		});
