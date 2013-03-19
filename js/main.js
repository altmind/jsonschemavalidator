var validators = {
	"tv4": function(jsonObject, schemaObject){
		var resp = tv4.validate(jsonObject, schemaObject);
		return {
			"ok":!!resp,
			"errors":tv4.error?[""+tv4.error.dataPath+": "+tv4.error.message]:undefined
		};
	},
	"jsv": function(selectedValidator, jsonObject, schemaObject){
		var environment = JSV.createEnvironment("json-schema-draft-"+selectedValidator.match(/^jsv-(\d+)/)[1]);
		var resp = environment.validate(environment.createInstance(jsonObject, "json"), environment.createSchema(schemaObject, null, "schema"));
		return {
			"ok": !resp.errors.length,
			"errors": $.map((resp.errors || []),function(itm,idx){
				return ""+itm.uri+": "+itm.message+"("+itm.details+")";
			})
		}
	},
	"json-schema-validator": function(jsonObject, schemaObject){
		var resp=jsonvalidator.validate(jsonObject, schemaObject);
		debugger;
		return {
			"ok":!resp.errors.length,
			"errors":$.map((resp.errors || []),function(itm,idx){
				return ""+itm.property+": "+itm.message;
			})
		}
	}
};
var renderResults = function(result){
	if (!result["ok"]){
		$.each(result["errors"],function(idx,el){
			$(".output-errors .errors-placeholder").append(""+el+"<br/>");
		});
		$(".output-errors").show();
	}
};

var validate = function(){

	$(".output-errors").hide();
	$(".output-errors .errors-placeholder").empty();

	var selectedValidator = $('input[name=validator]:checked', '.options').val();
	var jsonInput = $(".input-json textarea").val();
	var schemaInput = $(".input-schema textarea").val();
	var result={"ok":true,"errors":[]};
	try{
		var jsonObject = JSON.parse(jsonInput);
		var schemaObject = JSON.parse(schemaInput);
		if (selectedValidator=='tv4'){
			result = validators[selectedValidator](jsonObject, schemaObject);
		}
		else if (selectedValidator.match(/^jsv-(\d+)$/))
		{
			result = validators["jsv"](selectedValidator,jsonObject, schemaObject);	
		}
		else if (selectedValidator=='json-schema-validator'){
			result = validators[selectedValidator](jsonObject, schemaObject);
		}
	}
	catch (e){
		result["ok"]=false;
		result["errors"]=[""+e.toString()];
	}

	renderResults(result);
};

$(function(){
	$(".options button").bind('click', function(){
		validate();
	});
});