

# Interface

$('#timeline_id').timeline({
	data : [{source : "halle", start : "01-05-2010 20:00", end : "01-30-2015 00:00", content : "asdsad", description : "adzza"},
			{..}]
});

# DOM Insertion

<div id="timeline_id"></div>

===> 

<div id="timeline_id" class="tl-container">
	<div class="tl-header">
	<div class="tl-body">
		<div class="tl-events">
			<div class="tl-event">
				<div class="tl-event-head">
					<div class="tl-event-source">Halle</div>
					<div class="tl-event-date">6 <span>June</span>
				</div>
				<div class="tl-event-body">
					Yahooooodsadj lksakldjklsajdkjsakldjklsajdklsa jdksajdklsja kldjklsa jdkljsakldjska
				</div>
			</div>
			<div class="tl-event">
			..
			</div>
		</div>
	</div>
</div>